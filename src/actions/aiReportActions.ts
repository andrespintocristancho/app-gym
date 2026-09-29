"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function generateAiReport(clientId: string, period: "15D" | "30D" | "60D" | "MONTHLY" = "MONTHLY") {
  const days = period === "15D" ? 15 : period === "30D" ? 30 : 60;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const [current, previous] = await Promise.all([
    prisma.measurement.findFirst({
      where: { clientId },
      orderBy: { date: "desc" }
    }),
    prisma.measurement.findFirst({
      where: { clientId, date: { lte: cutoff } },
      orderBy: { date: "desc" }
    })
  ]);

  if (!current) {
    return { success: false, error: "No hay suficientes mediciones para generar el reporte." };
  }

  const prev = previous || current;
  const weightDelta = Number(((current.weight ?? 0) - (prev.weight ?? 0)).toFixed(1));
  const muscleDelta = Number(((current.leanMass ?? 0) - (prev.leanMass ?? 0)).toFixed(1));
  const waistDelta = Number(((current.waist ?? 0) - (prev.waist ?? 0)).toFixed(1));
  const armDelta = Number(((current.rightArm ?? 0) - (prev.rightArm ?? 0)).toFixed(1));
  const chestDelta = Number(((current.chest ?? 0) - (prev.chest ?? 0)).toFixed(1));
  const thighDelta = Number(((current.rightThigh ?? 0) - (prev.rightThigh ?? 0)).toFixed(1));

  let statusType = "POSITIVE_RECOMPOSITION";
  let conclusion = "";

  // Exact prompt business logic
  if (weightDelta > 0.3 && armDelta >= 0.2 && chestDelta >= 0 && waistDelta <= 0) {
    statusType = "MUSCLE_GAIN";
    conclusion = `Excelente progreso: Durante este periodo aumentaste ${weightDelta > 0 ? "+" : ""}${weightDelta} kg de peso, redujiste ${Math.abs(waistDelta)} cm de cintura y aumentaste ${armDelta} cm en brazos. La tendencia indica una ganancia muscular limpia de alta calidad.`;
  } else if (Math.abs(weightDelta) <= 1.2 && armDelta > 0 && waistDelta < 0) {
    statusType = "POSITIVE_RECOMPOSITION";
    conclusion = `Posible recomposición corporal positiva: Aumentaste masa muscular y redujiste grasa corporal simultáneamente (-${Math.abs(waistDelta)} cm en cintura, +${armDelta} cm en brazos). ¡Vas en la dirección perfecta!`;
  } else if (weightDelta < 0 && waistDelta < 0 && (muscleDelta >= -0.3 || armDelta >= -0.2)) {
    statusType = "FAT_LOSS";
    conclusion = `Pérdida de grasa exitosa: Redujiste ${Math.abs(weightDelta)} kg de peso corporal y ${Math.abs(waistDelta)} cm de perímetro abdominal manteniendo tu masa muscular intacta. Continúa con este déficit calórico controlado.`;
  } else if (weightDelta < 0 && armDelta < 0 && thighDelta < 0) {
    statusType = "MUSCLE_LOSS_WARNING";
    conclusion = `⚠️ Alerta de posible pérdida muscular: Has disminuido ${Math.abs(weightDelta)} kg de peso, pero también se redujeron los perímetros de brazo (-${Math.abs(armDelta)} cm) y muslo (-${Math.abs(thighDelta)} cm). Te sugerimos aumentar la ingesta de proteína y revisar la intensidad de entrenamiento.`;
  } else {
    statusType = "POSITIVE_RECOMPOSITION";
    conclusion = `Progreso constante: Tus métricas se mantienen estables con buena consistencia en el gimnasio. Mantén el ritmo de entrenamiento y sigue el plan de alimentación.`;
  }

  const now = new Date();
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const title = `Reporte Mensual ${months[now.getMonth()]} ${now.getFullYear()}`;

  const report = await prisma.aiReport.create({
    data: {
      clientId,
      title,
      period,
      conclusion,
      statusType,
      weightDelta,
      muscleDelta,
      waistDelta,
      strengthDelta: 10,
    }
  });

  revalidatePath("/dashboard/reports");
  revalidatePath("/dashboard/compare");
  return { success: true, report };
}

export async function getAiReports(clientId: string) {
  return prisma.aiReport.findMany({
    where: { clientId },
    orderBy: { date: "desc" }
  });
}
