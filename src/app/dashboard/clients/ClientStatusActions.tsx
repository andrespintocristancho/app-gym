"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteClient, updateClientStatus } from "@/actions/clientActions";

export function ClientStatusActions({ clientId, status }: { clientId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function change(nextStatus: "ACTIVE" | "SUSPENDED" | "DEBTOR") {
    setLoading(true);
    await updateClientStatus(clientId, nextStatus);
    router.refresh();
    setLoading(false);
  }
  async function remove() {
    if (!window.confirm("¿Eliminar este cliente y todos sus datos?")) return;
    setLoading(true);
    const result = await deleteClient(clientId);
    if (!result.success) window.alert(result.error);
    else router.push("/dashboard/clients");
    setLoading(false);
  }
  return <div className="flex flex-wrap gap-2"><button disabled={loading} onClick={() => change(status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED")} className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-300">{status === "SUSPENDED" ? "Reactivar" : "Suspender"}</button><button disabled={loading} onClick={() => change(status === "DEBTOR" ? "ACTIVE" : "DEBTOR")} className="rounded-lg bg-orange-500/10 px-3 py-2 text-xs font-bold text-orange-300">{status === "DEBTOR" ? "Quitar mora" : "Marcar mora"}</button><button disabled={loading} onClick={remove} className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300">Eliminar cliente</button></div>;
}