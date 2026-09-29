"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPayment } from "@/actions/paymentActions";

export function PaymentForm({ clients }: { clients: Array<{ id: string; user: { name: string } }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const data = new FormData(event.currentTarget);
    await createPayment({ clientId: String(data.get("clientId")), amount: Number(data.get("amount")), dueDate: String(data.get("dueDate")), status: String(data.get("status")) as "PAID" | "PENDING" | "OVERDUE" });
    event.currentTarget.reset();
    router.refresh();
    setLoading(false);
  }
  return <form onSubmit={submit} className="grid gap-3 rounded-xl border border-white/[0.07] bg-[#1c2028] p-4 sm:grid-cols-4"><select name="clientId" required className="rounded-lg border border-white/[0.08] bg-[#0a0e16] px-3 py-2 text-sm text-white"><option value="">Cliente</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.user.name}</option>)}</select><input name="amount" type="number" min="0" step="0.01" required placeholder="Monto" className="rounded-lg border border-white/[0.08] bg-[#0a0e16] px-3 py-2 text-sm text-white" /><input name="dueDate" type="date" required className="rounded-lg border border-white/[0.08] bg-[#0a0e16] px-3 py-2 text-sm text-white" /><button disabled={loading} className="rounded-lg bg-[#c3f400] px-4 py-2 text-sm font-bold text-[#161e00]">{loading ? "Guardando..." : "Registrar pago"}</button><select name="status" defaultValue="PENDING" className="rounded-lg border border-white/[0.08] bg-[#0a0e16] px-3 py-2 text-sm text-white sm:col-start-4"><option value="PENDING">Pendiente</option><option value="PAID">Pagado</option><option value="OVERDUE">En mora</option></select></form>;
}
