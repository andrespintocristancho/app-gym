"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { syncCentralEcosystem } from "@/lib/centralEngine";

export async function getRoutines() {
  const session = await getServerSession(authOptions);
  try {
    const routines = await prisma.routine.findMany({
      where: session?.user?.role === "CLIENT" ? { client: { userId: session.user.id } } : undefined,
      include: {
        client: {
          include: { user: true }
        },
        exercises: {
          include: { exercise: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return { success: true, routines };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Error al consultar rutinas." };
  }
}

export async function createRoutine(data: {
  name: string;
  clientId: string;
  imageUrl?: string;
  exercises: {
    exerciseId: string;
    sets: number;
    reps: number;
    recommendedWeight?: number;
    restTime?: string;
    observations?: string;
  }[]
}) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "TRAINER") {
    return { success: false, error: "Solo el entrenador puede crear rutinas." };
  }
  if (!data.name.trim()) return { success: false, error: "La rutina necesita un nombre." };
  if (!data.clientId) return { success: false, error: "Selecciona el cliente de la rutina." };
  if (!data.exercises.length) return { success: false, error: "Añade al menos un ejercicio." };

  try {
    const routine = await prisma.routine.create({
      data: {
        name: data.name,
        clientId: data.clientId,
        imageUrl: data.imageUrl,
        exercises: {
          create: data.exercises
        }
      }
    });

    // Sincronizar el ecosistema del cliente de inmediato
    await syncCentralEcosystem(data.clientId);

    revalidatePath("/dashboard/routines");
    revalidatePath(`/dashboard/clients/${data.clientId}`);
    return { success: true, routine };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Error al crear la rutina." };
  }
}

export async function copyRoutineToClient(sourceRoutineId: string, targetClientId: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "TRAINER") {
    return { success: false, error: "Solo el entrenador puede asignar rutinas." };
  }

  try {
    const source = await prisma.routine.findUnique({
      where: { id: sourceRoutineId },
      include: { exercises: true }
    });
    if (!source) return { success: false, error: "Rutina fuente no encontrada." };

    const newRoutine = await prisma.routine.create({
      data: {
        name: source.name,
        clientId: targetClientId,
        imageUrl: source.imageUrl,
        exercises: {
          create: source.exercises.map(e => ({
            exerciseId: e.exerciseId,
            sets: e.sets,
            reps: e.reps,
            recommendedWeight: e.recommendedWeight,
            restTime: e.restTime,
            observations: e.observations
          }))
        }
      }
    });

    await syncCentralEcosystem(targetClientId);
    revalidatePath(`/dashboard/clients/${targetClientId}`);
    revalidatePath("/dashboard/routines");
    return { success: true, routine: newRoutine };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Error al asignar rutina." };
  }
}

export async function deleteRoutine(routineId: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "TRAINER") {
    return { success: false, error: "Solo el entrenador puede eliminar rutinas." };
  }

  try {
    const routine = await prisma.routine.findUnique({
      where: { id: routineId },
      select: { clientId: true }
    });

    await prisma.routineExercise.deleteMany({
      where: { routineId }
    });

    await prisma.routine.delete({
      where: { id: routineId }
    });

    if (routine?.clientId) {
      await syncCentralEcosystem(routine.clientId);
      revalidatePath(`/dashboard/clients/${routine.clientId}`);
    }

    revalidatePath("/dashboard/routines");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Error al eliminar rutina." };
  }
}

