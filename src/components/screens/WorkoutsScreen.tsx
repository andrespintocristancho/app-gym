"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ChevronLeft, Plus, Dumbbell, Play, ChevronRight, CheckCircle2,
  TrendingUp, Award, Zap, Sparkles
} from "lucide-react";

interface WorkoutsScreenProps {
  clientId?: string;
  routines?: any[];
  history?: any[];
  workoutSummary?: {
    totalSessions: number;
    totalSets: number;
    strengthScore: number;
    strengthDeltaPct: number;
    keyPRs: Record<string, { name: string; maxWeight: number; prevMaxWeight: number; delta: number }>;
    trendText: string;
  };
}

export function WorkoutsScreen({ 
  clientId,
  routines = [], 
  history = [], 
  workoutSummary 
}: WorkoutsScreenProps) {
  const [tab, setTab] = useState<"rutinas" | "fuerza" | "historial">("rutinas");

  const benchPR = workoutSummary?.keyPRs?.["Press Banca"]?.maxWeight ?? 0;
  const benchDelta = workoutSummary?.keyPRs?.["Press Banca"]?.delta ?? 0;

  return (
    <div className="space-y-6 pb-24 max-w-lg mx-auto animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="rounded-full p-2 bg-white/5 text-[#94a3b8] hover:text-white transition">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-bold text-white">Entrenamientos y Fuerza</h1>
        <div className="w-9" />
      </div>

      {/* Tarjeta de Indicador de Fuerza Interconectado */}
      <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#131926]/90 via-[#0d131f]/90 to-[#070a10]/95 p-5 backdrop-blur-2xl shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#00d2ff]">Indicador de Fuerza</span>
              <h3 className="font-display text-base font-bold text-white">
                {workoutSummary?.strengthScore ? `${workoutSummary.strengthScore} Pts` : "En desarrollo"}
              </h3>
            </div>
          </div>
          {benchPR > 0 && (
            <div className="text-right">
              <span className="text-[10px] text-[#94a3b8] block">PR Press Banca</span>
              <strong className="text-sm font-black text-emerald-400">{benchPR} kg</strong>
            </div>
          )}
        </div>

        {/* Banner de Tendencia del Ecosistema */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-start gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#cbd5e1] leading-relaxed">
            <strong>Impacto en Masa Muscular:</strong> {workoutSummary?.trendText || "Cada aumento de carga en tus entrenamientos estimula la hipertrofia y actualiza automáticamente tus objetivos de fuerza y reportes."}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-[#131926]/80 p-1 border border-white/[0.08] backdrop-blur-xl">
        <button
          onClick={() => setTab("rutinas")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${tab === "rutinas" ? "bg-[#0066ff] text-white shadow-[0_0_15px_rgba(0,102,255,0.6)]" : "text-[#94a3b8] hover:text-white"}`}
        >
          Rutinas ({routines.length})
        </button>
        <button
          onClick={() => setTab("fuerza")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${tab === "fuerza" ? "bg-[#0066ff] text-white shadow-[0_0_15px_rgba(0,102,255,0.6)]" : "text-[#94a3b8] hover:text-white"}`}
        >
          Cargas Máximas
        </button>
        <button
          onClick={() => setTab("historial")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${tab === "historial" ? "bg-[#0066ff] text-white shadow-[0_0_15px_rgba(0,102,255,0.6)]" : "text-[#94a3b8] hover:text-white"}`}
        >
          Historial ({history.length})
        </button>
      </div>

      {tab === "rutinas" ? (
        <div className="space-y-4">
          {routines.length === 0 ? (
            <div className="text-center py-10 rounded-3xl border border-white/[0.08] bg-[#131926]/60 p-6 space-y-2">
              <Dumbbell className="h-10 w-10 text-[#64748b] mx-auto opacity-50" />
              <p className="text-[#94a3b8] text-sm">Tu entrenador aún no te ha asignado rutinas.</p>
              <p className="text-xs text-[#64748b]">Inicia un entrenamiento libre para registrar tus series y cargas.</p>
            </div>
          ) : (
            routines.map(routine => (
              <div key={routine.id} className="rounded-3xl border border-white/[0.08] bg-[#131926]/70 p-5 backdrop-blur-xl shadow-xl space-y-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-white">{routine.name}</h2>
                  <p className="text-xs text-[#94a3b8] mt-0.5">{routine.exercises?.length || 0} ejercicios programados</p>
                </div>
                <div className="space-y-2">
                  {routine.exercises?.map((re: any) => (
                    <Link
                      key={re.id}
                      href={`/dashboard/exercises/${re.exerciseId}`}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-[#080d16]/90 border border-white/5 hover:border-[#0066ff]/40 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-xl bg-[#0066ff]/10 flex items-center justify-center text-[#00d2ff]">
                          {re.exercise.imageUrl ? (
                            <img src={re.exercise.imageUrl} alt={re.exercise.name} className="h-full w-full object-cover" />
                          ) : (
                            <Dumbbell className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm group-hover:text-[#00d2ff] transition-colors">{re.exercise.name}</h3>
                          <p className="text-xs text-[#94a3b8] mt-0.5">{re.sets} x {re.reps} - {re.recommendedWeight ? `${re.recommendedWeight}kg` : "Carga libre"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#00d2ff] font-bold">
                        <span>Ver / Registrar</span>
                        <ChevronRight className="h-4 w-4 text-[#94a3b8] group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
          <Link href="/dashboard/timer" className="w-full rounded-2xl bg-gradient-to-r from-[#0066ff] to-[#0084ff] py-4 text-sm font-bold text-white shadow-[0_0_25px_rgba(0,102,255,0.7)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2">
            <Play className="h-4 w-4 fill-white" /> Iniciar Temporizador de Series
          </Link>
        </div>
      ) : tab === "fuerza" ? (
        /* Cargas Máximas / Récords */
        <div className="space-y-4">
          <div className="rounded-3xl border border-white/[0.08] bg-[#131926]/70 p-5 backdrop-blur-xl shadow-xl space-y-4">
            <div>
              <h3 className="font-display text-base font-bold text-white">Récords Personales (PRs)</h3>
              <p className="text-xs text-[#94a3b8] mt-0.5">Máximos pesos registrados por ejercicio</p>
            </div>

            {Object.keys(workoutSummary?.keyPRs || {}).length === 0 ? (
              <div className="py-8 text-center text-xs text-[#64748b]">
                Aún no has registrado series con peso. Entra a cualquier ejercicio y registra tus series para ver tus récords aquí.
              </div>
            ) : (
              <div className="space-y-2.5">
                {Object.values(workoutSummary?.keyPRs || {}).map(pr => (
                  <div key={pr.name} className="p-3.5 rounded-2xl bg-[#080d16] border border-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{pr.name}</h4>
                      <span className="text-[11px] text-[#94a3b8]">
                        Anterior: {pr.prevMaxWeight} kg
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-display text-lg font-black text-[#00d2ff]">{pr.maxWeight} kg</span>
                      {pr.delta > 0 && (
                        <span className="block text-[10px] font-bold text-[#22c55e]">+{pr.delta} kg</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Historial */
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-10 text-[#94a3b8] text-sm">
              No existen registros de entrenamiento todavía.
            </div>
          ) : (
            history.map((item, i) => (
              <div key={i} className="rounded-2xl border border-white/[0.08] bg-[#131926]/70 p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#00d2ff]">{new Date(item.date).toLocaleDateString()}</span>
                  <h4 className="font-bold text-white text-sm mt-0.5">{item.routine?.name || "Entrenamiento Libre"}</h4>
                  <p className="text-xs text-[#94a3b8] mt-1">{item.sets?.length || 0} series completadas</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-[#22c55e]" />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
