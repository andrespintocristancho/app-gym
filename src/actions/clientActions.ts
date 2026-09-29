"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createClient(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "TRAINER") {
    return { success: false, error: "Solo el entrenador puede crear usuarios." };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;
  const age = Number(formData.get("age"));
  const gender = formData.get("gender") as string;
  const observations = formData.get("observations") as string;

  try {
    if (!password || password.length < 6) {
      return { success: false, error: "La contraseña debe tener al menos 6 caracteres." };
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CLIENT",
        clientProfile: {
          create: {
            phone,
            age,
            gender,
            observations,
            status: "ACTIVE",
          },
        },
      },
    });

    revalidatePath("/dashboard/clients");
    return { success: true, user };
  } catch (error) {
    console.error("Error creating client:", error);
    return { success: false, error: "Error al crear el cliente. Es posible que el correo ya exista." };
  }
}

export async function getClients() {
  try {
    const clients = await prisma.clientProfile.findMany({
      include: {
        user: true,
      },
      orderBy: {
        user: { name: 'asc' }
      }
    });
    return { success: true, clients };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Error al consultar clientes." };
  }
}

export async function updateClientStatus(clientId: string, status: "ACTIVE" | "SUSPENDED" | "DEBTOR" | "INACTIVE" | string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "TRAINER") return { success: false, error: "Solo el entrenador puede cambiar estados." };
  await prisma.clientProfile.update({ where: { id: clientId }, data: { status } });
  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${clientId}`);
  return { success: true };
}

export async function deleteClient(clientId: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "TRAINER") return { success: false, error: "Solo el entrenador puede eliminar clientes." };
  const client = await prisma.clientProfile.findUnique({ where: { id: clientId }, select: { userId: true } });
  if (!client) return { success: false, error: "Cliente no encontrado." };
  await prisma.user.delete({ where: { id: client.userId } });
  revalidatePath("/dashboard/clients");
  return { success: true };
}

export async function assignSmartPlan(clientId: string, planType: "MUSCLE_GAIN" | "FAT_LOSS" | "RECOMPOSITION", weeks: number) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "TRAINER") return { success: false, error: "Solo el entrenador puede asignar planes." };

  const client = await prisma.clientProfile.findUnique({
    where: { id: clientId },
    include: {
      measurements: { orderBy: { date: "desc" }, take: 1 }
    }
  });
  if (!client) return { success: false, error: "Cliente no encontrado." };

  const m = client.measurements[0];
  const currentWeight = m?.weight ?? 75;
  const currentWaist = m?.waist ?? 85;
  const currentArm = m?.rightArm ?? 36;
  const currentBodyFat = m?.bodyFat ?? 18;

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + weeks * 7);

  const goalsToCreate: { title: string; targetValue: number; currentValue: number; unit: string; deadline: Date }[] = [];
  let nutritionTarget = { targetCalories: 2400, targetProtein: 160, targetCarbs: 300, targetFats: 70 };
  let reportConclusion = "";
  let reportStatus = "POSITIVE_RECOMPOSITION";

  if (planType === "MUSCLE_GAIN") {
    const targetWeight = Number((currentWeight + Math.round(weeks * 0.25)).toFixed(1));
    const targetArm = Number((currentArm + 2).toFixed(1));
    goalsToCreate.push(
      { title: "Ganar masa muscular (Peso objetivo)", targetValue: targetWeight, currentValue: currentWeight, unit: "kg", deadline },
      { title: "Incrementar volumen de brazos (Bíceps)", targetValue: targetArm, currentValue: currentArm, unit: "cm", deadline },
      { title: "Mantener perímetro de cintura", targetValue: currentWaist, currentValue: currentWaist, unit: "cm", deadline }
    );
    nutritionTarget = {
      targetCalories: Math.round(currentWeight * 33 + 300),
      targetProtein: Math.round(currentWeight * 2.0),
      targetCarbs: Math.round(currentWeight * 4.0),
      targetFats: Math.round(currentWeight * 0.9)
    };
    reportStatus = "MUSCLE_GAIN";
    reportConclusion = `Plan de Ganancia Muscular iniciado (${weeks} semanas). Metas y calorías asignadas automáticamente. Se monitoreará quincenalmente la evolución de brazos, peso y cintura para asegurar ganancia limpia.`;
  } else if (planType === "FAT_LOSS") {
    const targetWeight = Number((currentWeight - Math.round(weeks * 0.4)).toFixed(1));
    const targetWaist = Number((currentWaist - Math.round(weeks * 0.5)).toFixed(1));
    const targetFat = Number((Math.max(10, currentBodyFat - Math.round(weeks * 0.3))).toFixed(1));
    goalsToCreate.push(
      { title: "Perder grasa corporal (Peso objetivo)", targetValue: targetWeight, currentValue: currentWeight, unit: "kg", deadline },
      { title: "Reducir perímetro de cintura", targetValue: targetWaist, currentValue: currentWaist, unit: "cm", deadline },
      { title: "Reducir porcentaje de grasa", targetValue: targetFat, currentValue: currentBodyFat, unit: "%", deadline }
    );
    nutritionTarget = {
      targetCalories: Math.max(1600, Math.round(currentWeight * 26 - 400)),
      targetProtein: Math.round(currentWeight * 2.2),
      targetCarbs: Math.round(currentWeight * 2.0),
      targetFats: Math.round(currentWeight * 0.7)
    };
    reportStatus = "FAT_LOSS";
    reportConclusion = `Plan de Pérdida de Grasa iniciado (${weeks} semanas). Déficit calórico moderado configurado con alta proteína para proteger la masa magra.`;
  } else {
    const targetWaist = Number((currentWaist - 3).toFixed(1));
    const targetArm = Number((currentArm + 1.5).toFixed(1));
    goalsToCreate.push(
      { title: "Recomposición: Reducción de cintura", targetValue: targetWaist, currentValue: currentWaist, unit: "cm", deadline },
      { title: "Recomposición: Ganancia muscular en brazos", targetValue: targetArm, currentValue: currentArm, unit: "cm", deadline }
    );
    nutritionTarget = {
      targetCalories: Math.round(currentWeight * 30),
      targetProtein: Math.round(currentWeight * 2.2),
      targetCarbs: Math.round(currentWeight * 3.0),
      targetFats: Math.round(currentWeight * 0.8)
    };
    reportStatus = "POSITIVE_RECOMPOSITION";
    reportConclusion = `Plan de Recomposición Corporal (${weeks} semanas). Se busca oxidar grasa y construir músculo al mismo tiempo.`;
  }

  for (const g of goalsToCreate) {
    await prisma.goal.create({
      data: {
        clientId,
        title: g.title,
        targetValue: g.targetValue,
        currentValue: g.currentValue,
        unit: g.unit,
        deadline: g.deadline,
        achieved: false
      }
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existingLog = await prisma.nutritionLog.findFirst({
    where: { clientId, date: { gte: today, lt: tomorrow } }
  });

  if (existingLog) {
    await prisma.nutritionLog.update({
      where: { id: existingLog.id },
      data: nutritionTarget
    });
  } else {
    await prisma.nutritionLog.create({
      data: {
        clientId,
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        ...nutritionTarget
      }
    });
  }

  await prisma.aiReport.create({
    data: {
      clientId,
      title: `Plan ${planType === "MUSCLE_GAIN" ? "Hipertrofia" : planType === "FAT_LOSS" ? "Definición" : "Recomposición"} - ${weeks} Semanas`,
      period: "15D",
      conclusion: reportConclusion,
      statusType: reportStatus,
      weightDelta: 0,
      muscleDelta: 0,
      waistDelta: 0,
      strengthDelta: 0
    }
  });

  // Disparar la sincronización central del ecosistema
  const { syncCentralEcosystem } = await import("@/lib/centralEngine");
  await syncCentralEcosystem(clientId);

  return { success: true };
}
