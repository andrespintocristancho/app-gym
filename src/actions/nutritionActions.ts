"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { syncCentralEcosystem } from "@/lib/centralEngine";

export async function getTodayNutrition(clientId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Buscar log de hoy
  let log = await prisma.nutritionLog.findFirst({
    where: {
      clientId,
      date: { gte: today, lt: tomorrow }
    }
  });

  // Si no hay log de hoy, buscar el más reciente para heredar las metas (targetCalories, etc.)
  if (!log) {
    const recentTarget = await prisma.nutritionLog.findFirst({
      where: { clientId, targetCalories: { gt: 0 } },
      orderBy: { date: "desc" }
    });

    return {
      id: null,
      calories: 0,
      targetCalories: recentTarget?.targetCalories ?? 0,
      protein: 0,
      targetProtein: recentTarget?.targetProtein ?? 0,
      carbs: 0,
      targetCarbs: recentTarget?.targetCarbs ?? 0,
      fats: 0,
      targetFats: recentTarget?.targetFats ?? 0,
      mealsJson: null
    };
  }

  return log;
}

export async function addMeal(clientId: string, meal: {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Buscar las metas más recientes asignadas por el instructor
  const recentTarget = await prisma.nutritionLog.findFirst({
    where: { clientId, targetCalories: { gt: 0 } },
    orderBy: { date: "desc" }
  });

  let log = await prisma.nutritionLog.findFirst({
    where: { clientId, date: { gte: today, lt: tomorrow } }
  });

  const newMealEntry = {
    time: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
    name: meal.name,
    cals: meal.calories,
    p: meal.protein,
    c: meal.carbs,
    f: meal.fats
  };

  if (!log) {
    log = await prisma.nutritionLog.create({
      data: {
        clientId,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fats: meal.fats,
        targetCalories: recentTarget?.targetCalories ?? 0,
        targetProtein: recentTarget?.targetProtein ?? 0,
        targetCarbs: recentTarget?.targetCarbs ?? 0,
        targetFats: recentTarget?.targetFats ?? 0,
        mealsJson: JSON.stringify([newMealEntry])
      }
    });
  } else {
    const existingMeals = (() => {
      try { return log.mealsJson ? JSON.parse(log.mealsJson) : []; }
      catch { return []; }
    })();

    log = await prisma.nutritionLog.update({
      where: { id: log.id },
      data: {
        calories: log.calories + meal.calories,
        protein: log.protein + meal.protein,
        carbs: log.carbs + meal.carbs,
        fats: log.fats + meal.fats,
        mealsJson: JSON.stringify([...existingMeals, newMealEntry])
      }
    });
  }

  // Sincronizar ecosistema: verifica cumplimiento calórico, dispara alertas y actualiza objetivos
  await syncCentralEcosystem(clientId);

  return { success: true, log };
}

export async function updateNutritionTargets(clientId: string, targets: {
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const log = await prisma.nutritionLog.findFirst({
    where: { clientId, date: { gte: today, lt: tomorrow } }
  });

  if (log) {
    await prisma.nutritionLog.update({
      where: { id: log.id },
      data: targets
    });
  } else {
    await prisma.nutritionLog.create({
      data: { clientId, calories: 0, protein: 0, carbs: 0, fats: 0, ...targets }
    });
  }

  // Sincronización del ecosistema al actualizar metas nutricionales
  await syncCentralEcosystem(clientId);

  return { success: true };
}
