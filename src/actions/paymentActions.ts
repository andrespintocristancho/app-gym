"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createPayment(data: { 
  clientId: string; 
  amount: number; 
  dueDate: string; 
  status: "PAID" | "PENDING" | "OVERDUE";
  balanceDue?: number;
  paymentDate?: string;
}) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "TRAINER") return { success: false, error: "Solo el entrenador puede registrar pagos." };
  
  try {
    const payment = await prisma.payment.create({ 
      data: { 
        clientId: data.clientId, 
        amount: data.amount, 
        dueDate: new Date(data.dueDate), 
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
        status: data.status,
        balanceDue: data.balanceDue || 0
      } 
    });

    // Automatically update client status to DEBTOR if status is OVERDUE
    if (data.status === "OVERDUE" || (data.balanceDue && data.balanceDue > 0)) {
      await prisma.clientProfile.update({
        where: { id: data.clientId },
        data: { status: "DEBTOR" }
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/payments");
    revalidatePath("/dashboard/clients");
    revalidatePath(`/dashboard/clients/${data.clientId}`);
    return { success: true, payment };
  } catch (error) {
    console.error("Error creating payment:", error);
    return { success: false, error: "Error al registrar el pago." };
  }
}

export async function updatePaymentStatus(paymentId: string, status: "PAID" | "PENDING" | "OVERDUE") {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "TRAINER") return { success: false, error: "Solo el entrenador puede cambiar pagos." };
  
  try {
    const payment = await prisma.payment.update({ 
      where: { id: paymentId }, 
      data: { status } 
    });

    // Check if client has other overdue payments
    const overdueCount = await prisma.payment.count({
      where: { clientId: payment.clientId, status: "OVERDUE" }
    });

    if (overdueCount === 0 && status === "PAID") {
      await prisma.clientProfile.update({
        where: { id: payment.clientId },
        data: { status: "ACTIVE" }
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/payments");
    revalidatePath("/dashboard/clients");
    revalidatePath(`/dashboard/clients/${payment.clientId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating payment:", error);
    return { success: false, error: "Error al actualizar estado del pago." };
  }
}

export async function deletePayment(paymentId: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "TRAINER") return { success: false, error: "No autorizado." };

  try {
    const payment = await prisma.payment.delete({
      where: { id: paymentId }
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/payments");
    return { success: true };
  } catch (error) {
    console.error("Error deleting payment:", error);
    return { success: false, error: "Error al eliminar el pago." };
  }
}