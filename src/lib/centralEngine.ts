import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { computeDerivedFields, analyseProgress } from "./bodyAnalysis";

export interface KeyExercisePR {
  name: string;
  maxWeight: number;
  prevMaxWeight: number;
  delta: number;
}

export interface EcosystemData {
  clientId: string;
  clientName: string;
  hasData: boolean;
  measurementsSummary: {
    latest: any | null;
    previous: any | null;
    initial: any | null;
    count: number;
    weight: number;
    weightDelta: number;
    initialWeightDelta: number;
    waist: number;
    waistDelta: number;
    initialWaistDelta: number;
    arm: number;
    armDelta: number;
    chest: number;
    chestDelta: number;
    thigh: number;
    thighDelta: number;
    bodyFat: number;
    bodyFatDelta: number;
    leanMass: number;
    leanMassDelta: number;
    bmi: number;
    bmiLabel: string;
    trendLabel: string;
    trendColor: string;
  };
  workoutSummary: {
    totalSessions: number;
    totalSets: number;
    lastSessionDate: string | null;
    strengthScore: number;
    strengthDeltaPct: number;
    keyPRs: Record<string, KeyExercisePR>;
    trendText: string;
  };
  nutritionSummary: {
    todayCalories: number;
    targetCalories: number;
    todayProtein: number;
    targetProtein: number;
    todayCarbs: number;
    targetCarbs: number;
    todayFats: number;
    targetFats: number;
    calorieDifference: number;
    complianceStatus: "COMPLIANT" | "SURPLUS_ALERT" | "DEFICIT_ALERT" | "NO_TARGET";
    complianceMessage: string;
    hasAlert: boolean;
  };
  goalsSummary: {
    totalCount: number;
    activeCount: number;
    completedCount: number;
    overallPercentage: number;
    goals: Array<{
      id: string;
      title: string;
      targetValue: number;
      currentValue: number;
      progressPercentage: number;
      unit: string;
      deadline: Date | null;
      achieved: boolean;
      sourceLabel: string;
    }>;
  };
  photosSummary: {
    count: number;
    photos: Array<{
      id: string;
      url: string;
      date: string;
      weight?: number | null;
      tag?: string | null;
      notes?: string | null;
      correlationText: string;
    }>;
  };
  aiAnalysis: {
    title: string;
    conclusion: string;
    statusType: "POSITIVE_RECOMPOSITION" | "MUSCLE_GAIN" | "FAT_LOSS" | "MUSCLE_LOSS_WARNING";
    statusTitle: string;
    statusColor: string;
    alerts: string[];
    predictions: {
      days15Weight: number;
      days30Weight: number;
      days30Waist: number;
      projectionText: string;
    };
    recommendations: string[];
  };
}

/**
 * Motor central de cálculo del ecosistema FitPro Evolution.
 * Recopila y cruza Medidas, Entrenamientos, Nutrición, Objetivos y Fotos.
 */
export async function computeEcosystemData(clientId: string): Promise<EcosystemData | null> {
  const profile = await prisma.clientProfile.findUnique({
    where: { id: clientId },
    include: {
      user: true,
      measurements: { orderBy: { date: "asc" } },
      goals: { orderBy: { createdAt: "desc" } },
      workoutSessions: {
        orderBy: { date: "asc" },
        include: {
          sets: {
            include: { exercise: true }
          }
        }
      },
      nutritionLogs: {
        orderBy: { date: "desc" },
        take: 14
      },
      progressPhotos: {
        orderBy: { date: "asc" }
      },
      aiReports: {
        orderBy: { date: "desc" },
        take: 1
      }
    }
  });

  if (!profile) return null;

  const measurements = profile.measurements || [];
  const count = measurements.length;
  const latest = count > 0 ? measurements[count - 1] : null;
  const previous = count > 1 ? measurements[count - 2] : null;
  const initial = count > 0 ? measurements[0] : null;

  // 1. Resumen de Medidas Corporales
  const weight = latest?.weight ?? 0;
  const weightDelta = (latest?.weight && previous?.weight) ? Number((latest.weight - previous.weight).toFixed(1)) : 0;
  const initialWeightDelta = (latest?.weight && initial?.weight) ? Number((latest.weight - initial.weight).toFixed(1)) : 0;

  const waist = latest?.waist ?? 0;
  const waistDelta = (latest?.waist && previous?.waist) ? Number((latest.waist - previous.waist).toFixed(1)) : 0;
  const initialWaistDelta = (latest?.waist && initial?.waist) ? Number((latest.waist - initial.waist).toFixed(1)) : 0;

  const arm = latest?.rightArm ?? latest?.leftArm ?? 0;
  const prevArm = previous?.rightArm ?? previous?.leftArm ?? 0;
  const initArm = initial?.rightArm ?? initial?.leftArm ?? 0;
  const armDelta = (arm && prevArm) ? Number((arm - prevArm).toFixed(1)) : 0;

  const chest = latest?.chest ?? 0;
  const prevChest = previous?.chest ?? 0;
  const chestDelta = (chest && prevChest) ? Number((chest - prevChest).toFixed(1)) : 0;

  const thigh = latest?.rightThigh ?? latest?.leftThigh ?? 0;
  const prevThigh = previous?.rightThigh ?? previous?.leftThigh ?? 0;
  const thighDelta = (thigh && prevThigh) ? Number((thigh - prevThigh).toFixed(1)) : 0;

  const bodyFat = latest?.bodyFat ?? 0;
  const bodyFatDelta = (latest?.bodyFat && previous?.bodyFat) ? Number((latest.bodyFat - previous.bodyFat).toFixed(1)) : 0;

  const leanMass = latest?.leanMass ?? (weight && bodyFat ? Number((weight * (1 - bodyFat / 100)).toFixed(1)) : 0);
  const prevLeanMass = previous?.leanMass ?? (previous?.weight && previous?.bodyFat ? Number((previous.weight * (1 - previous.bodyFat / 100)).toFixed(1)) : 0);
  const leanMassDelta = (leanMass && prevLeanMass) ? Number((leanMass - prevLeanMass).toFixed(1)) : 0;

  const bmi = latest?.bmi ?? (weight && latest?.height ? Number((weight / Math.pow(latest.height / 100, 2)).toFixed(1)) : 0);
  const bmiLabel = bmi === 0 ? "–" : bmi < 18.5 ? "Bajo peso" : bmi < 25 ? "Normal" : bmi < 30 ? "Sobrepeso" : "Obesidad";

  const progressAssessment = latest && previous ? analyseProgress(latest, previous) : { label: "Estable — sin cambios", color: "#aab1a1" };

  // 2. Resumen de Entrenamientos y Fuerza
  const sessions = profile.workoutSessions || [];
  const totalSessions = sessions.length;
  let totalSets = 0;
  const keyPRs: Record<string, KeyExercisePR> = {};

  sessions.forEach(sess => {
    (sess.sets || []).forEach(st => {
      totalSets++;
      const exName = (st.exercise?.name || "General").trim();
      const exKey = exName.toLowerCase();

      // Normalizar nombre de ejercicios principales
      let normGroup = "otro";
      if (exKey.includes("banca") || exKey.includes("bench")) normGroup = "Press Banca";
      else if (exKey.includes("sentadilla") || exKey.includes("squat")) normGroup = "Sentadilla";
      else if (exKey.includes("muerto") || exKey.includes("deadlift")) normGroup = "Peso Muerto";
      else if (exKey.includes("militar") || exKey.includes("press hombro")) normGroup = "Press Militar";
      else normGroup = exName;

      if (!keyPRs[normGroup]) {
        keyPRs[normGroup] = { name: normGroup, maxWeight: st.weightKg, prevMaxWeight: st.weightKg, delta: 0 };
      } else {
        if (st.weightKg > keyPRs[normGroup].maxWeight) {
          keyPRs[normGroup].prevMaxWeight = keyPRs[normGroup].maxWeight;
          keyPRs[normGroup].maxWeight = st.weightKg;
          keyPRs[normGroup].delta = Number((keyPRs[normGroup].maxWeight - keyPRs[normGroup].prevMaxWeight).toFixed(1));
        }
      }
    });
  });

  // Cálculo del Indicador de Fuerza
  const benchPR = keyPRs["Press Banca"]?.maxWeight ?? 0;
  const squatPR = keyPRs["Sentadilla"]?.maxWeight ?? 0;
  const deadliftPR = keyPRs["Peso Muerto"]?.maxWeight ?? 0;
  const strengthScore = benchPR + squatPR + deadliftPR || (benchPR ? benchPR * 2 : Math.max(30, totalSessions * 5));
  
  const benchDelta = keyPRs["Press Banca"]?.delta ?? 0;
  const strengthDeltaPct = benchPR > 0 && benchDelta > 0 
    ? Number(((benchDelta / (benchPR - benchDelta)) * 100).toFixed(1))
    : (totalSessions >= 3 ? 5 : 0);

  const strengthTrendText = benchDelta > 0 
    ? `+${benchDelta} kg en Press Banca (+${strengthDeltaPct}%), estimulando hipertrofia de pecho y tríceps.`
    : totalSessions > 0
    ? `Consistencia de ${totalSessions} entrenamientos completados manteniendo niveles de fuerza.`
    : "Sin registros recientes de fuerza.";

  // 3. Resumen de Nutrición y Balance Calórico
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayLog = (profile.nutritionLogs || []).find(l => {
    const d = new Date(l.date);
    return d >= today && d < tomorrow;
  }) || profile.nutritionLogs?.[0]; // fallback al último registro si no hay de hoy

  const todayCalories = todayLog?.calories ?? 0;
  const targetCalories = todayLog?.targetCalories ?? 0;
  const todayProtein = todayLog?.protein ?? 0;
  const targetProtein = todayLog?.targetProtein ?? 0;
  const todayCarbs = todayLog?.carbs ?? 0;
  const targetCarbs = todayLog?.targetCarbs ?? 0;
  const todayFats = todayLog?.fats ?? 0;
  const targetFats = todayLog?.targetFats ?? 0;

  const calorieDifference = targetCalories > 0 ? todayCalories - targetCalories : 0;
  let complianceStatus: "COMPLIANT" | "SURPLUS_ALERT" | "DEFICIT_ALERT" | "NO_TARGET" = "NO_TARGET";
  let complianceMessage = "Sin meta calórica configurada por tu instructor.";
  let hasAlert = false;

  if (targetCalories > 0) {
    if (todayCalories === 0) {
      complianceStatus = "DEFICIT_ALERT";
      complianceMessage = "Aún no registras comidas el día de hoy.";
    } else if (calorieDifference > 180) {
      complianceStatus = "SURPLUS_ALERT";
      complianceMessage = `⚠️ Alerta Calórica: Has consumido ${todayCalories} kcal (+${calorieDifference} kcal sobre tu meta). El exceso sostenido impactará el % de grasa corporal.`;
      hasAlert = true;
    } else if (calorieDifference < -400) {
      complianceStatus = "DEFICIT_ALERT";
      complianceMessage = `⚠️ Ingesta Insuficiente: Estás ${Math.abs(calorieDifference)} kcal por debajo de tu meta. Puede comprometer tu recuperación y masa muscular.`;
      hasAlert = true;
    } else {
      complianceStatus = "COMPLIANT";
      complianceMessage = `✅ Meta Cumplida: Tu ingesta calórica (${todayCalories} kcal) está alineada perfectamente con tu plan de transformación.`;
    }
  }

  // 4. Objetivos: Cálculo 100% Automático sin campos manuales
  const evaluatedGoals = (profile.goals || []).map(g => {
    const titleLower = g.title.toLowerCase();
    let currentCalculated = g.currentValue;
    let sourceLabel = "Cálculo automático";
    let isReduction = false;

    if (titleLower.includes("cintura") || titleLower.includes("waist") || titleLower.includes("abdomen")) {
      currentCalculated = waist || g.currentValue;
      sourceLabel = `Medidas Corporales: Cintura (${currentCalculated} cm)`;
      isReduction = true;
    } else if (titleLower.includes("peso") || titleLower.includes("weight")) {
      currentCalculated = weight || g.currentValue;
      sourceLabel = `Medidas Corporales: Peso (${currentCalculated} kg)`;
      // Si la meta es menor al peso inicial, es reducción de peso
      isReduction = g.targetValue < (initial?.weight ?? currentCalculated);
    } else if (titleLower.includes("brazo") || titleLower.includes("bíceps") || titleLower.includes("biceps") || titleLower.includes("arm")) {
      currentCalculated = arm || g.currentValue;
      sourceLabel = `Medidas Corporales: Brazo (${currentCalculated} cm)`;
    } else if (titleLower.includes("grasa") || titleLower.includes("fat")) {
      currentCalculated = bodyFat || g.currentValue;
      sourceLabel = `Composición: % Grasa (${currentCalculated}%)`;
      isReduction = true;
    } else if (titleLower.includes("músculo") || titleLower.includes("musculo") || titleLower.includes("magra") || titleLower.includes("lean")) {
      currentCalculated = leanMass || g.currentValue;
      sourceLabel = `Composición: Masa Magra (${currentCalculated} kg)`;
    } else if (titleLower.includes("pecho") || titleLower.includes("chest")) {
      currentCalculated = chest || g.currentValue;
      sourceLabel = `Medidas Corporales: Pecho (${currentCalculated} cm)`;
    } else if (titleLower.includes("banca") || titleLower.includes("bench")) {
      currentCalculated = benchPR || g.currentValue;
      sourceLabel = `Entrenamientos: PR Press Banca (${currentCalculated} kg)`;
    } else if (titleLower.includes("fuerza") || titleLower.includes("strength")) {
      currentCalculated = benchPR || strengthScore;
      sourceLabel = `Entrenamientos: Nivel de Fuerza (${currentCalculated} kg)`;
    } else if (titleLower.includes("entreno") || titleLower.includes("sesion") || titleLower.includes("workout")) {
      currentCalculated = totalSessions;
      sourceLabel = `Historial: ${totalSessions} Entrenamientos`;
    } else if (titleLower.includes("caloría") || titleLower.includes("caloria") || titleLower.includes("dieta")) {
      currentCalculated = todayCalories;
      sourceLabel = `Nutrición: Ingesta (${todayCalories} kcal)`;
    }

    // Cálculo dinámico del porcentaje de avance
    let pct = 0;
    if (g.targetValue > 0) {
      if (isReduction) {
        // Ejemplo: Si meta es 80 y actual es 82, si inicial era 90:
        const initVal = initial?.weight || initial?.waist || (g.targetValue + 5);
        if (initVal > g.targetValue) {
          const totalDistance = initVal - g.targetValue;
          const covered = initVal - currentCalculated;
          pct = Math.max(0, Math.min(100, Math.round((covered / totalDistance) * 100)));
        } else {
          pct = currentCalculated <= g.targetValue ? 100 : Math.round((g.targetValue / currentCalculated) * 100);
        }
      } else {
        pct = Math.max(0, Math.min(100, Math.round((currentCalculated / g.targetValue) * 100)));
      }
    }

    const achieved = isReduction 
      ? currentCalculated <= g.targetValue && currentCalculated > 0
      : currentCalculated >= g.targetValue;

    if (achieved) pct = 100;

    return {
      id: g.id,
      title: g.title,
      targetValue: g.targetValue,
      currentValue: currentCalculated,
      progressPercentage: pct,
      unit: g.unit,
      deadline: g.deadline,
      achieved,
      sourceLabel
    };
  });

  const activeGoals = evaluatedGoals.filter(g => !g.achieved);
  const completedGoals = evaluatedGoals.filter(g => g.achieved);
  const overallPercentage = evaluatedGoals.length > 0
    ? Math.round(evaluatedGoals.reduce((sum, g) => sum + g.progressPercentage, 0) / evaluatedGoals.length)
    : 0;

  // 5. Fotografías vinculadas con Medidas Corporales
  const photosWithCorrelations = (profile.progressPhotos || []).map((p, idx) => {
    // Buscar la medición más cercana a la fecha de la foto
    const pDate = new Date(p.date).getTime();
    let closestM: any = null;
    let minDiff = Infinity;
    measurements.forEach(m => {
      const diff = Math.abs(new Date(m.date).getTime() - pDate);
      if (diff < minDiff) {
        minDiff = diff;
        closestM = m;
      }
    });

    let correlationText = "Fotografía de referencia inicial.";
    if (closestM && initial && closestM.id !== initial.id) {
      const dWaist = Number(((closestM.waist ?? 0) - (initial.waist ?? 0)).toFixed(1));
      const dWeight = Number(((closestM.weight ?? 0) - (initial.weight ?? 0)).toFixed(1));
      const dArm = Number(((closestM.rightArm ?? 0) - (initial.rightArm ?? 0)).toFixed(1));

      if (dWaist < -1) {
        correlationText = `Coincide con reducción de cintura registrada (${dWaist} cm).`;
      } else if (dArm > 0.5) {
        correlationText = `Coincide con incremento en perímetro de brazo (+${dArm} cm) e hipertrofia.`;
      } else if (dWeight < -1) {
        correlationText = `Coincide con disminución de peso corporal (${dWeight} kg).`;
      } else if (dWeight > 1) {
        correlationText = `Coincide con incremento de masa muscular (+${dWeight} kg).`;
      } else {
        correlationText = "Coincide con tono y recomposición corporal progresiva.";
      }
    } else if (initialWaistDelta < 0) {
      correlationText = `Coincide con reducción de cintura registrada (${initialWaistDelta} cm).`;
    }

    return {
      id: p.id,
      url: p.photoUrl,
      date: new Date(p.date).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }),
      weight: p.weight ?? closestM?.weight,
      tag: p.tag,
      notes: p.notes,
      correlationText
    };
  });

  // 6. Análisis Central IA: Conclusiones, Alertas, Predicciones y Recomendaciones
  let statusType: "POSITIVE_RECOMPOSITION" | "MUSCLE_GAIN" | "FAT_LOSS" | "MUSCLE_LOSS_WARNING" = "POSITIVE_RECOMPOSITION";
  let statusTitle = "Recomposición Positiva";
  let statusColor = "#22c55e";
  let conclusion = "";

  const alerts: string[] = [];

  // Chequeo de alertas transversales
  if (hasAlert) {
    alerts.push(complianceMessage);
  }
  if (weightDelta < -0.6 && armDelta < -0.3 && thighDelta < -0.3) {
    statusType = "MUSCLE_LOSS_WARNING";
    statusTitle = "⚠️ Riesgo de Pérdida Muscular";
    statusColor = "#f43f5e";
    alerts.push("Alerta: Disminución simultánea de peso, brazo y pierna detectada. Eleva tu consumo de proteína y cuida la intensidad en el gym.");
  }

  // Generación de Conclusión Integral
  if (weightDelta > 0.3 && waistDelta < 0 && (armDelta >= 0.2 || leanMassDelta > 0)) {
    statusType = "POSITIVE_RECOMPOSITION";
    statusTitle = "Recomposición Corporal Positiva";
    statusColor = "#22c55e";
    conclusion = `Excelente recomposición corporal: Aumentaste peso (+${weightDelta} kg) y perímetro de brazo (+${armDelta} cm) mientras redujiste cintura (${waistDelta} cm). ${benchDelta > 0 ? `Se complementa con un incremento de +${benchDelta} kg en Press Banca.` : ""} Tu disciplina en nutrición y entrenamientos está generando músculo puro y reduciendo grasa abdominal sin pérdida de rendimiento.`;
  } else if (weightDelta > 0.4 && armDelta >= 0.2 && waistDelta <= 0.3) {
    statusType = "MUSCLE_GAIN";
    statusTitle = "Ganancia Muscular Limpia";
    statusColor = "#0066ff";
    conclusion = `Ganancia muscular destacada: Incrementaste +${weightDelta} kg de peso corporal con aumento de ${armDelta} cm en brazos y conservación de cintura. Tu superávit calórico y la sobrecarga progresiva en el gimnasio están funcionando de forma óptima.`;
  } else if (weightDelta < -0.3 && waistDelta < -0.4 && armDelta >= -0.2) {
    statusType = "FAT_LOSS";
    statusTitle = "Pérdida de Grasa Exitosa";
    statusColor = "#22c55e";
    conclusion = `Definición exitosa: Redujiste ${Math.abs(weightDelta)} kg de peso corporal y ${Math.abs(waistDelta)} cm de cintura preservando tu masa magra intacta. El déficit calórico estructurado está cumpliendo el objetivo programado.`;
  } else if (statusType === "MUSCLE_LOSS_WARNING") {
    conclusion = `Alerta de pérdida muscular: Disminución acelerada de peso (-${Math.abs(weightDelta)} kg) con reducción en brazos (-${Math.abs(armDelta)} cm). Recomendamos ajustar de inmediato la ingesta de proteína a mínimo 2g/kg y pausar cardio de alta intensidad.`;
  } else if (initialWaistDelta < 0 && initialWeightDelta >= 0) {
    statusType = "POSITIVE_RECOMPOSITION";
    statusTitle = "Recomposición Corporal Acumulada";
    statusColor = "#22c55e";
    conclusion = `Progreso acumulado: Desde el inicio has reducido ${Math.abs(initialWaistDelta)} cm de cintura con una ganancia neta de +${initialWeightDelta} kg de peso corporal, lo que confirma una transformación de recomposición corporal integral.`;
  } else {
    conclusion = `Progreso constante y disciplina sostenida: Tus métricas de composición se mantienen firmes. Con ${totalSessions} sesiones registradas y seguimiento continuo de medidas, estás construyendo una base física sólida.`;
  }

  // Predicciones Predictivas
  const days15Weight = weight ? Number((weight + (weightDelta * 0.8)).toFixed(1)) : 0;
  const days30Weight = weight ? Number((weight + (weightDelta * 1.6)).toFixed(1)) : 0;
  const days30Waist = waist ? Number((waist + (waistDelta * 1.5)).toFixed(1)) : 0;

  const projectionText = weightDelta !== 0 || waistDelta !== 0
    ? `A este ritmo, en los próximos 30 días se proyecta un peso de ${days30Weight} kg y un perímetro de cintura de ${days30Waist} cm.`
    : "Mantén el registro periódico de medidas para proyectar tu ritmo de avance en 30 días.";

  // Recomendaciones Inteligentes
  const recommendations: string[] = [];
  if (statusType === "MUSCLE_LOSS_WARNING") {
    recommendations.push("Aumenta la proteína a 2.2g por kg de peso corporal para frenar el catabolismo.");
    recommendations.push("Reduce las series al fallo y prioriza descanso de 3 minutos en ejercicios compuestos.");
  } else if (statusType === "FAT_LOSS") {
    recommendations.push("Mantén tu déficit calórico y asegura 1.5 a 2 litros de agua por cada 1,000 kcal consumidas.");
    recommendations.push("Conserva la carga en tus levantamientos principales para enviar la señal de retención muscular.");
  } else if (statusType === "MUSCLE_GAIN") {
    recommendations.push("Aplica sobrecarga progresiva: busca añadir 1 repetición o 1.25 kg por lado en tu próxima sesión de press banca o sentadilla.");
    recommendations.push("Asegura entre 7 y 8 horas de sueño para maximizar la síntesis de proteína nocturna.");
  } else {
    recommendations.push("Registra una nueva medición corporal cada 15 días para mantener el ecosistema actualizado.");
    recommendations.push("Sube una foto de frente y perfil cada mes para calibrar el comparador visual antes/después.");
  }

  const now = new Date();
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const title = `Reporte Integral ${months[now.getMonth()]} ${now.getFullYear()}`;

  return {
    clientId: profile.id,
    clientName: profile.user?.name || "Atleta",
    hasData: count > 0,
    measurementsSummary: {
      latest,
      previous,
      initial,
      count,
      weight,
      weightDelta,
      initialWeightDelta,
      waist,
      waistDelta,
      initialWaistDelta,
      arm,
      armDelta,
      chest,
      chestDelta,
      thigh,
      thighDelta,
      bodyFat,
      bodyFatDelta,
      leanMass,
      leanMassDelta,
      bmi,
      bmiLabel,
      trendLabel: progressAssessment.label,
      trendColor: progressAssessment.color
    },
    workoutSummary: {
      totalSessions,
      totalSets,
      lastSessionDate: sessions.length > 0 ? sessions[sessions.length - 1].date.toISOString() : null,
      strengthScore,
      strengthDeltaPct,
      keyPRs,
      trendText: strengthTrendText
    },
    nutritionSummary: {
      todayCalories,
      targetCalories,
      todayProtein,
      targetProtein,
      todayCarbs,
      targetCarbs,
      todayFats,
      targetFats,
      calorieDifference,
      complianceStatus,
      complianceMessage,
      hasAlert
    },
    goalsSummary: {
      totalCount: evaluatedGoals.length,
      activeCount: activeGoals.length,
      completedCount: completedGoals.length,
      overallPercentage,
      goals: evaluatedGoals
    },
    photosSummary: {
      count: photosWithCorrelations.length,
      photos: photosWithCorrelations
    },
    aiAnalysis: {
      title,
      conclusion,
      statusType,
      statusTitle,
      statusColor,
      alerts,
      predictions: {
        days15Weight,
        days30Weight,
        days30Waist,
        projectionText
      },
      recommendations
    }
  };
}

/**
 * Sincroniza y actualiza la base de datos de forma cruzada para todos los módulos.
 * Ejecutado automáticamente cuando cambia:
 * - Una Medida Corporal
 * - Un Entrenamiento / Serie
 * - Una Comida o Meta Nutricional
 * - Una Fotografía
 * - Una Modificación del Instructor (Dieta, Rutina, Objetivos)
 */
export async function syncCentralEcosystem(clientId: string): Promise<EcosystemData | null> {
  const data = await computeEcosystemData(clientId);
  if (!data) return null;

  // 1. Sincronizar todos los objetivos en la base de datos
  for (const g of data.goalsSummary.goals) {
    await prisma.goal.update({
      where: { id: g.id },
      data: {
        currentValue: g.currentValue,
        achieved: g.achieved
      }
    });
  }

  // 2. Guardar o actualizar el reporte IA central
  const existingReport = await prisma.aiReport.findFirst({
    where: { clientId },
    orderBy: { date: "desc" }
  });

  const reportPayload = {
    title: data.aiAnalysis.title,
    period: "15D",
    conclusion: data.aiAnalysis.conclusion,
    statusType: data.aiAnalysis.statusType,
    weightDelta: data.measurementsSummary.weightDelta,
    muscleDelta: data.measurementsSummary.leanMassDelta,
    waistDelta: data.measurementsSummary.waistDelta,
    strengthDelta: data.workoutSummary.strengthDeltaPct
  };

  if (existingReport) {
    await prisma.aiReport.update({
      where: { id: existingReport.id },
      data: reportPayload
    });
  } else {
    await prisma.aiReport.create({
      data: {
        clientId,
        ...reportPayload
      }
    });
  }

  // 3. Revalidar todas las rutas del ecosistema
  revalidatePath(`/dashboard/clients/${clientId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/measurements");
  revalidatePath("/dashboard/goals");
  revalidatePath("/dashboard/nutrition");
  revalidatePath("/dashboard/workouts");
  revalidatePath("/dashboard/photos");
  revalidatePath("/dashboard/evolution");
  revalidatePath("/dashboard/compare");
  revalidatePath("/dashboard/composition");
  revalidatePath("/dashboard/analytics");
  revalidatePath("/dashboard/reports");

  return data;
}
