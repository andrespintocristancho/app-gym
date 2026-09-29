"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function markAttendance(clientId: string) {
  try {
    // Verificar si ya marcó hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existing = await prisma.attendance.findFirst({
      where: {
        clientId,
        date: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (existing) {
      return { success: false, error: "Ya se registró la asistencia el día de hoy." };
    }

    const attendance = await prisma.attendance.create({
      data: {
        clientId,
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/progress");
    revalidatePath("/dashboard/attendance");
    
    return { success: true, attendance };
  } catch (error) {
    console.error("Error marking attendance:", error);
    return { success: false, error: "Ocurrió un error al registrar la asistencia." };
  }
}
