"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { syncCentralEcosystem } from "@/lib/centralEngine";

export async function createGoal(clientId: string, data: {
  title: string;
  targetValue: number;
  unit: string;
  deadline?: string;
}) {
  const goal = await prisma.goal.create({
    data: {
      clientId,
      title: data.title,
      targetValue: data.targetValue,
      currentValue: 0, // Se calcula automáticamente de inmediato en syncCentralEcosystem
      unit: data.unit,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
    }
  });

  // Cálculo automático del progreso real desde medidas, entrenamientos o nutrición
  await syncCentralEcosystem(clientId);

  return { success: true, goal };
}

export async function updateGoal(id: string, data: {
  title?: string;
  targetValue?: number;
  unit?: string;
  deadline?: string;
}) {
  const existing = await prisma.goal.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Objetivo no encontrado" };

  const goal = await prisma.goal.update({
    where: { id },
    data: {
      title: data.title ?? existing.title,
      targetValue: data.targetValue ?? existing.targetValue,
      unit: data.unit ?? existing.unit,
      deadline: data.deadline ? new Date(data.deadline) : existing.deadline,
    }
  });

  await syncCentralEcosystem(existing.clientId);

  return { success: true, goal };
}

export async function deleteGoal(id: string) {
  const existing = await prisma.goal.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Objetivo no encontrado" };

  await prisma.goal.delete({ where: { id } });
  await syncCentralEcosystem(existing.clientId);

  return { success: true };
}

export async function syncGoalProgress(clientId: string): Promise<void> {
  await syncCentralEcosystem(clientId);
}
