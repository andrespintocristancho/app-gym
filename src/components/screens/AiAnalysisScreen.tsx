"use client";

import Link from "next/link";
import { 
  ChevronLeft, Sparkles, CheckCircle2, AlertCircle, 
  TrendingUp, Lightbulb, Scale, Utensils, Dumbbell, Camera, Target, RefreshCw
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface AiAnalysisScreenProps {
  clientId?: string;
  ecosystem?: any;
}

export function AiAnalysisScreen({ clientId, ecosystem }: AiAnalysisScreenProps) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 800);
  };

  if (!ecosystem || !ecosystem.hasData) {
    return (
      <div className="space-y-6 pb-24 max-w-lg mx-auto animate-fadeIn">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="rounded-full p-2 bg-white/5 text-[#94a3b8] hover:text-white transition">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-xl font-bold text-white">Módulo Central IA</h1>
          <div className="w-9" />
        </div>
        <div className="rounded-3xl border border-white/[0.08] bg-[#131926]/70 p-8 text-center space-y-4">
          <Sparkles className="h-12 w-12 text-[#0066ff] mx-auto opacity-60" />
          <h3 className="font-bold text-white">Esperando datos iniciales</h3>
          <p className="text-sm text-[#94a3b8] leading-relaxed">
            El motor de IA requiere al menos un registro de medidas corporales para activar el análisis predictivo y las conclusiones de recomposición.
          </p>
          <Link 
            href="/dashboard/measurements" 
            className="inline-block rounded-2xl bg-[#0066ff] px-6 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/30"
          >
            Registrar primera medida
          </Link>
        </div>
      </div>
    );
  }

  const ai = ecosystem.aiAnalysis;
  const m = ecosystem.measurementsSummary;
  const w = ecosystem.workoutSummary;
  const n = ecosystem.nutritionSummary;
  const p = ecosystem.photosSummary;
  const g = ecosystem.goalsSummary;

  return (
    <div className="space-y-6 pb-24 max-w-lg mx-auto animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="rounded-full p-2 bg-white/5 text-[#94a3b8] hover:text-white transition">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#00d2ff]">Motor Central</span>
          <h1 className="font-display text-xl font-bold text-white">Análisis IA</h1>
        </div>
        <button 
          onClick={handleRefresh}
          className="rounded-full p-2 bg-white/5 text-[#94a3b8] hover:text-white transition"
          title="Recalcular análisis"
        >
          <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin text-[#00d2ff]" : ""}`} />
        </button>
      </div>

      {/* Tarjeta de Conclusión Principal */}
      <div className="rounded-3xl border border-[#00d2ff]/30 bg-gradient-to-b from-[#081a2e]/90 via-[#0a1524]/90 to-[#070a10]/95 p-6 backdrop-blur-2xl shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#0066ff]/20 text-[#00d2ff]">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">Diagnóstico Integral</span>
              <h2 className="font-display text-base font-bold text-white">{ai.statusTitle}</h2>
            </div>
          </div>
          <span className="rounded-full px-3 py-1 text-xs font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            En Vivo
          </span>
        </div>

        <div className="h-px bg-white/[0.06]" />

        <p className="text-sm text-[#e2e8f0] leading-relaxed font-medium">
          {ai.conclusion}
        </p>

        {/* Quick Deltas Bar */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-[#94a3b8] block">Δ Peso</span>
            <strong className={`font-display text-sm font-black ${m.weightDelta > 0 ? "text-[#00d2ff]" : m.weightDelta < 0 ? "text-[#22c55e]" : "text-white"}`}>
              {m.weightDelta > 0 ? `+${m.weightDelta}` : m.weightDelta} kg
            </strong>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-[#94a3b8] block">Δ Cintura</span>
            <strong className={`font-display text-sm font-black ${m.waistDelta < 0 ? "text-[#22c55e]" : "text-amber-400"}`}>
              {m.waistDelta > 0 ? `+${m.waistDelta}` : m.waistDelta} cm
            </strong>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
            <span className="text-[10px] text-[#94a3b8] block">Fuerza PRs</span>
            <strong className="font-display text-sm font-black text-emerald-400">
              +{w.strengthDeltaPct}%
            </strong>
          </div>
        </div>
      </div>

      {/* Red de Datos Interconectados */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#131926]/70 p-5 backdrop-blur-xl space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] flex items-center gap-1.5">
          <Target className="h-4 w-4 text-[#00d2ff]" />
          Fuentes Conectadas en Tiempo Real
        </h3>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Link href="/dashboard/measurements" className="p-3 rounded-xl bg-[#080d16] border border-white/5 hover:border-[#0066ff]/40 transition space-y-1">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold">
              <Scale className="h-3.5 w-3.5" /> Medidas ({m.count})
            </div>
            <p className="text-[11px] text-[#94a3b8]">Peso: {m.weight}kg · Cintura: {m.waist}cm</p>
          </Link>

          <Link href="/dashboard/workouts" className="p-3 rounded-xl bg-[#080d16] border border-white/5 hover:border-[#0066ff]/40 transition space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Dumbbell className="h-3.5 w-3.5" /> Entrenos ({w.totalSessions})
            </div>
            <p className="text-[11px] text-[#94a3b8]">Fuerza: {w.strengthScore} Pts</p>
          </Link>

          <Link href="/dashboard/nutrition" className="p-3 rounded-xl bg-[#080d16] border border-white/5 hover:border-[#0066ff]/40 transition space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Utensils className="h-3.5 w-3.5" /> Nutrición
            </div>
            <p className="text-[11px] text-[#94a3b8]">{n.todayCalories}/{n.targetCalories || "–"} kcal</p>
          </Link>

          <Link href="/dashboard/photos" className="p-3 rounded-xl bg-[#080d16] border border-white/5 hover:border-[#0066ff]/40 transition space-y-1">
            <div className="flex items-center gap-1.5 text-purple-400 font-bold">
              <Camera className="h-3.5 w-3.5" /> Fotos ({p.count})
            </div>
            <p className="text-[11px] text-[#94a3b8]">Correlación visual activa</p>
          </Link>
        </div>
      </div>

      {/* Alertas Detectadas */}
      {ai.alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 px-1">
            <AlertCircle className="h-4 w-4" /> Alertas Automáticas
          </h3>
          {ai.alerts.map((alert: string, idx: number) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{alert}</span>
            </div>
          ))}
        </div>
      )}

      {/* Predicciones */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#131926]/70 p-5 backdrop-blur-xl space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#00d2ff] flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-[#00d2ff]" /> Predicciones a 15 y 30 Días
        </h3>
        <p className="text-xs text-[#cbd5e1] leading-relaxed">
          {ai.predictions.projectionText}
        </p>
        <div className="grid grid-cols-2 gap-2 pt-1 text-center">
          <div className="p-2.5 rounded-xl bg-[#080d16] border border-white/5">
            <span className="text-[10px] text-[#94a3b8] block">Estimado en 15 días</span>
            <strong className="text-sm font-bold text-white mt-0.5 block">{ai.predictions.days15Weight} kg</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-[#080d16] border border-white/5">
            <span className="text-[10px] text-[#94a3b8] block">Estimado en 30 días</span>
            <strong className="text-sm font-bold text-[#00d2ff] mt-0.5 block">{ai.predictions.days30Weight} kg</strong>
          </div>
        </div>
      </div>

      {/* Recomendaciones */}
      {ai.recommendations.length > 0 && (
        <div className="rounded-3xl border border-white/[0.08] bg-[#131926]/70 p-5 backdrop-blur-xl space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Lightbulb className="h-4 w-4 text-emerald-400" /> Recomendaciones Activas
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {ai.recommendations.map((rec: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#00d2ff] font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
