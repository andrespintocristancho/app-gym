"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getExercises() {
  try {
    const exercises = await prisma.exercise.findMany({
      orderBy: { name: "asc" }
    });
    return { success: true, exercises };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createExercise(data: {
  name: string;
  muscleGroup: string;
  imageUrl?: string;
  description?: string;
  technique?: string;
  commonErrors?: string;
}) {
  try {
    const exercise = await prisma.exercise.create({
      data: { ...data, imageUrl: data.imageUrl || null }
    });
    revalidatePath("/dashboard/exercises");
    return { success: true, exercise };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteExercise(id: string) {
  try {
    await prisma.exercise.delete({ where: { id } });
    revalidatePath("/dashboard/exercises");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
