"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteRoutine } from "@/actions/routineActions";
import { useRouter } from "next/navigation";

export function RoutineActions({ routineId }: { routineId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm("¿Eliminar esta rutina y sus ejercicios?")) return;
    setDeleting(true);
    const result = await deleteRoutine(routineId);
    if (!result.success) {
      window.alert(result.error || "No se pudo eliminar la rutina.");
      setDeleting(false);
      return;
    }
    router.refresh();
  }

  return (
    <button type="button" onClick={handleDelete} disabled={deleting} aria-label="Eliminar rutina" title="Eliminar rutina" className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-50">
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
