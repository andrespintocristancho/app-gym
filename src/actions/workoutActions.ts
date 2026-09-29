"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { syncCentralEcosystem } from "@/lib/centralEngine";

export async function logWorkoutSet(data: {
  clientId: string;
  exerciseId: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe?: number;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let session = await prisma.workoutSession.findFirst({
    where: {
      clientId: data.clientId,
      date: { gte: today }
    }
  });

  if (!session) {
    session = await prisma.workoutSession.create({
      data: {
        clientId: data.clientId,
        date: new Date(),
      }
    });
  }

  const set = await prisma.workoutSet.create({
    data: {
      sessionId: session.id,
      exerciseId: data.exerciseId,
      setNumber: data.setNumber,
      reps: data.reps,
      weightKg: data.weightKg,
      rpe: data.rpe
    }
  });

  // Disparar sincronización automática del ecosistema:
  // Actualiza indicador de fuerza, PRs, objetivos de entrenamiento y reportes IA
  await syncCentralEcosystem(data.clientId);

  revalidatePath(`/dashboard/exercises/${data.exerciseId}`);
  revalidatePath("/dashboard/workouts");
  return { success: true, set };
}

export async function getExerciseSets(exerciseId: string, clientId?: string) {
  return prisma.workoutSet.findMany({
    where: {
      exerciseId,
      ...(clientId ? { session: { clientId } } : {})
    },
    include: { session: true },
    orderBy: { session: { date: "desc" } },
    take: 20
  });
}
