"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Info, CheckCircle, Activity, Target } from "lucide-react";

interface ExerciseDetailScreenProps {
  exerciseId: string;
  exerciseName?: string;
  muscleGroup?: string;
  imageUrl?: string;
  technique?: string;
  commonErrors?: string;
}

export function ExerciseDetailScreen({
  exerciseId,
  exerciseName = "Ejercicio",
  muscleGroup = "General",
  imageUrl,
  technique = "Asegúrate de mantener una buena postura durante todo el movimiento.",
  commonErrors = "Evita usar impulso en lugar de fuerza muscular."
}: ExerciseDetailScreenProps) {
  const [tab, setTab] = useState<"registrar" | "historial">("registrar");
  const [currentWeight, setCurrentWeight] = useState("0");
  const [currentReps, setCurrentReps] = useState("0");

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Serie registrada: ${currentWeight} kg x ${currentReps} reps`);
    setCurrentWeight("0");
    setCurrentReps("0");
  };

  return (
    <div className="space-y-6 pb-24 max-w-lg mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/workouts" className="rounded-full p-2 bg-white/5 text-[#94a3b8] hover:text-white transition">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-bold text-white text-center">{exerciseName}</h1>
        <div className="w-9" />
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-[#131926]/80 p-1 border border-white/[0.08] backdrop-blur-xl">
        <button
          onClick={() => setTab("registrar")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${tab === "registrar" ? "bg-[#0066ff] text-white shadow-[0_0_15px_rgba(0,102,255,0.6)]" : "text-[#94a3b8] hover:text-white"}`}
        >
          Registrar
        </button>
        <button
          onClick={() => setTab("historial")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${tab === "historial" ? "bg-[#0066ff] text-white shadow-[0_0_15px_rgba(0,102,255,0.6)]" : "text-[#94a3b8] hover:text-white"}`}
        >
          Técnica & Historial
        </button>
      </div>

      {tab === "registrar" ? (
        <div className="space-y-5">
          {/* Main Visual */}
          {imageUrl ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-white/[0.1] bg-[#070a10] shadow-2xl">
              <img
                src={imageUrl}
                alt={exerciseName}
                className="h-full w-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070a10] via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="rounded-full bg-[#0066ff]/20 border border-[#0066ff]/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#00d2ff]">
                  {muscleGroup}
                </span>
              </div>
            </div>
          ) : (
            <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-white/[0.1] bg-[#070a10] shadow-2xl flex items-center justify-center flex-col text-[#94a3b8]">
              <Target className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">Sin imagen</p>
              <div className="absolute bottom-4 left-4">
                <span className="rounded-full bg-[#0066ff]/20 border border-[#0066ff]/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#00d2ff]">
                  {muscleGroup}
                </span>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/[0.08] bg-[#131926]/70 p-4 backdrop-blur-xl">
              <span className="text-[10px] font-bold uppercase text-[#94a3b8]">Récord Peso</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-display text-2xl font-black text-white">0</span>
                <span className="text-xs text-[#94a3b8]">kg</span>
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-[#131926]/70 p-4 backdrop-blur-xl">
              <span className="text-[10px] font-bold uppercase text-[#94a3b8]">Récord Vol.</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-display text-2xl font-black text-white">0</span>
                <span className="text-xs text-[#94a3b8]">kg</span>
              </div>
            </div>
          </div>

          {/* Input Form */}
          <div className="rounded-3xl border border-white/[0.08] bg-[#131926]/70 p-5 backdrop-blur-xl shadow-xl space-y-4">
            <h3 className="font-display text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[#00d2ff]" /> Nueva Serie
            </h3>
            <form onSubmit={handleComplete} className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-[#94a3b8] block mb-1">Peso (kg)</label>
                <input
                  type="number"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#080d16] px-4 py-3 text-lg font-bold text-white text-center focus:border-[#0066ff] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-[#94a3b8] block mb-1">Repeticiones</label>
                <input
                  type="number"
                  value={currentReps}
                  onChange={(e) => setCurrentReps(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#080d16] px-4 py-3 text-lg font-bold text-white text-center focus:border-[#0066ff] focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="col-span-2 mt-2 rounded-xl bg-gradient-to-r from-[#0066ff] to-[#0084ff] py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(0,102,255,0.4)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                Completar Serie
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
           {/* Info Boxes */}
           <div className="rounded-2xl border border-white/[0.08] bg-[#131926]/70 p-4 space-y-2">
             <h4 className="font-bold text-white text-sm flex items-center gap-2">
               <Info className="h-4 w-4 text-[#00d2ff]" /> Técnica Correcta
             </h4>
             <p className="text-xs text-[#94a3b8] leading-relaxed">{technique}</p>
           </div>
           
           <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-4 space-y-2">
             <h4 className="font-bold text-red-400 text-sm flex items-center gap-2">
               <Activity className="h-4 w-4" /> Errores Comunes
             </h4>
             <p className="text-xs text-red-400/80 leading-relaxed">{commonErrors}</p>
           </div>
        </div>
      )}
    </div>
  );
}
