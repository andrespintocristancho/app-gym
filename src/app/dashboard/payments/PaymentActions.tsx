"use client";

import { useRouter } from "next/navigation";
import { updatePaymentStatus } from "@/actions/paymentActions";

export function PaymentActions({ paymentId, status }: { paymentId: string; status: string }) {
  const router = useRouter();
  async function setStatus(nextStatus: "PAID" | "PENDING" | "OVERDUE") {
    await updatePaymentStatus(paymentId, nextStatus);
    router.refresh();
  }
  return <div className="flex gap-2"><button onClick={() => setStatus("PAID")} className="rounded bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-300">Pagado</button><button onClick={() => setStatus(status === "OVERDUE" ? "PENDING" : "OVERDUE")} className="rounded bg-orange-500/10 px-2 py-1 text-[10px] font-bold text-orange-300">{status === "OVERDUE" ? "Pendiente" : "Marcar mora"}</button></div>;
}