"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ChevronLeft, Scale, Dumbbell, Flame, Sparkles, CheckCircle2, AlertCircle
} from "lucide-react";

interface Measurement {
  date: Date | string;
  weight?: number | null;
  rightArm?: number | null;
  chest?: number | null;
  waist?: number | null;
  abdomen?: number | null;
  hip?: number | null;
  bodyFat?: number | null;
  leanMass?: number | null;
}

interface CompareScreenProps {
  measurements: Measurement[];
}

type Period = "7" | "15" | "30" | "60" | "90" | "180";

function findClosest(measurements: Measurement[], daysAgo: number): Measurement | null {
  if (measurements.length < 2) return null;
  const target = new Date();
  target.setDate(target.getDate() - daysAgo);

  const sorted = [...measurements].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const latest = sorted[sorted.length - 1];

  // Buscar medición pasada más cercana al objetivo
  const candidates = sorted.filter(m => m !== latest && new Date(m.date) <= target);
  if (candidates.length > 0) {
    return candidates[candidates.length - 1];
  }

  // Fallback: si no hay exactamente de esa fecha, usar la medición inmediatamente anterior o inicial
  return sorted.filter(m => m !== latest)[0] || null;
}

function fmt(val: number | null | undefined, unit: string): string {
  if (val == null) return "–";
  return `${val} ${unit}`;
}

function diff(curr: number | null | undefined, prev: number | null | undefined, unit: string, invert = false) {
  if (curr == null || prev == null) return { label: "–", positive: null };
  const d = Number((curr - prev).toFixed(1));
  if (d === 0) return { label: "sin cambios", positive: null };
  const positive = invert ? d < 0 : d > 0;
  return { label: `${d > 0 ? "+" : ""}${d} ${unit}`, positive };
}

function generateConclusion(curr: Measurement, prev: Measurement): { text: string; type: "positive" | "warning" | "neutral" } {
  const wDiff = Number(((curr.weight ?? 0) - (prev.weight ?? 0)).toFixed(1));
  const waistDiff = Number(((curr.waist ?? 0) - (prev.waist ?? 0)).toFixed(1));
  const armDiff = Number(((curr.rightArm ?? 0) - (prev.rightArm ?? 0)).toFixed(1));
  const chestDiff = Number(((curr.chest ?? 0) - (prev.chest ?? 0)).toFixed(1));

  if (wDiff > 0.3 && waistDiff < 0 && (armDiff >= 0.2 || chestDiff >= 0)) {
    return { 
      text: `Excelente recomposición corporal: Aumentaste peso (+${wDiff} kg) y perímetro de brazo (+${armDiff} cm) mientras redujiste cintura (${waistDiff} cm). Tu plan nutricional y la intensidad en el gimnasio están construyendo músculo puro y reduciendo grasa abdominal.`, 
      type: "positive" 
    };
  }
  if (wDiff > 0.4 && armDiff >= 0.2 && waistDiff <= 0.3) {
    return { 
      text: `Ganancia muscular limpia: Incrementaste +${wDiff} kg y +${armDiff} cm en brazos manteniendo bajo control tu cintura. Excelente sobrecarga progresiva.`, 
      type: "positive" 
    };
  }
  if (wDiff < -0.3 && waistDiff < 0) {
    return { 
      text: `Pérdida de grasa exitosa: Redujiste ${Math.abs(wDiff)} kg de peso corporal y ${Math.abs(waistDiff)} cm de cintura. Mantén la proteína alta para conservar tu masa magra.`, 
      type: "positive" 
    };
  }
  if (wDiff < -0.5 && armDiff < -0.3) {
    return { 
      text: `⚠️ Alerta de pérdida muscular: Disminución simultánea de peso (${wDiff} kg) y perímetro de brazo (${armDiff} cm). Ajusta tu plan nutricional aumentando la proteína.`, 
      type: "warning" 
    };
  }
  if (wDiff > 1 && waistDiff > 0.5) {
    return { 
      text: "El peso y la cintura aumentaron conjuntamente. Considera ajustar las calorías con tu instructor para optimizar la masa magra.", 
      type: "warning" 
    };
  }
  return { 
    text: "Tus medidas se mantienen en un rango de adaptación estable. Continúa con constancia en tus entrenamientos.", 
    type: "neutral" 
  };
}

export function CompareScreen({ measurements }: CompareScreenProps) {
  const [period, setPeriod] = useState<Period>("30");

  const sorted = [...measurements].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const latest = sorted[sorted.length - 1] ?? null;
  const prev = findClosest(sorted, Number(period));

  const hasEnoughData = measurements.length >= 2 && latest && prev && latest !== prev;

  const metrics = hasEnoughData && latest && prev ? [
    { label: "Peso", icon: Scale, color: "#0066ff", curr: latest.weight, prevVal: prev.weight, unit: "kg", invert: false },
    { label: "Bíceps", icon: Dumbbell, color: "#00d2ff", curr: latest.rightArm, prevVal: prev.rightArm, unit: "cm", invert: false },
    { label: "Pecho", icon: Flame, color: "#f59e0b", curr: latest.chest, prevVal: prev.chest, unit: "cm", invert: false },
    { label: "Cintura", icon: Sparkles, color: "#22c55e", curr: latest.waist, prevVal: prev.waist, unit: "cm", invert: true },
    { label: "Abdomen", icon: Sparkles, color: "#22c55e", curr: latest.abdomen, prevVal: prev.abdomen, unit: "cm", invert: true },
    { label: "Cadera", icon: Scale, color: "#94a3b8", curr: latest.hip, prevVal: prev.hip, unit: "cm", invert: true },
  ] : [];

  const conclusion = hasEnoughData && latest && prev ? generateConclusion(latest, prev) : null;

  return (
    <div className="space-y-6 pb-24 max-w-lg mx-auto animate-fadeIn">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="rounded-full p-2 bg-white/5 text-[#94a3b8] hover:text-white transition">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-bold text-white">Comparar</h1>
        <div className="w-9" />
      </div>

      {/* Period Selector */}
      <div className="grid grid-cols-3 gap-2">
        {(["7", "15", "30", "60", "90", "180"] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`py-2.5 text-xs font-bold rounded-xl transition-all ${period === p ? "bg-[#0066ff] text-white shadow-[0_0_15px_rgba(0,102,255,0.6)]" : "bg-[#131926]/80 text-[#94a3b8] hover:text-white border border-white/[0.08]"}`}
          >
            {p} días
          </button>
        ))}
      </div>

      {/* Empty State */}
      {!hasEnoughData ? (
        <div className="rounded-3xl border border-white/[0.08] bg-[#131926]/70 p-8 text-center space-y-3">
          <Scale className="h-10 w-10 text-[#64748b] mx-auto opacity-50" />
          <h3 className="font-bold text-white text-sm">
            {measurements.length < 2
              ? "Necesitas al menos 2 mediciones para comparar"
              : `No hay medición de hace ${period} días`}
          </h3>
          <p className="text-xs text-[#64748b]">
            Registra tus medidas corporales regularmente para ver comparaciones automáticas de 7, 15, 30, 60, 90 y 180 días.
          </p>
          <Link href="/dashboard/measurements" className="inline-block mt-2 rounded-xl bg-[#0066ff]/20 border border-[#0066ff]/30 px-4 py-2 text-xs font-bold text-[#0066ff] hover:bg-[#0066ff]/30 transition">
            Ir a medidas →
          </Link>
        </div>
      ) : (
        <>
          {/* Date Range */}
          {prev && latest && (
            <div className="flex items-center justify-between text-[11px] text-[#64748b] px-1">
              <span>Inicio: {new Date(prev.date).toLocaleDateString()}</span>
              <span>→</span>
              <span>Actual: {new Date(latest.date).toLocaleDateString()}</span>
            </div>
          )}

          {/* Comparison Rows */}
          <div className="space-y-3">
            {metrics.map(m => {
              const d = diff(m.curr, m.prevVal, m.unit, m.invert);
              return (
                <div key={m.label} className="rounded-2xl border border-white/[0.08] bg-[#131926]/70 p-4 backdrop-blur-xl flex items-center justify-between shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${m.color}15` }}>
                      <m.icon className="h-5 w-5" style={{ color: m.color }} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block">{m.label}</span>
                      <p className="font-bold text-white text-sm">
                        {fmt(m.prevVal, m.unit)}
                        <span className="text-[#64748b] font-normal mx-2">→</span>
                        {fmt(m.curr, m.unit)}
                      </p>
                    </div>
                  </div>
                  <span className={`font-display text-sm font-black ${d.positive === null ? "text-[#64748b]" : d.positive ? "text-[#22c55e]" : "text-[#f43f5e]"}`}>
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* AI Conclusion */}
          {conclusion && (
            <div className={`rounded-3xl border p-5 backdrop-blur-2xl space-y-2 ${
              conclusion.type === "positive" ? "border-[#22c55e]/40 bg-gradient-to-b from-[#132c20]/90 to-[#0c1a13]/90 shadow-[0_15px_40px_rgba(34,197,94,0.2)]"
              : conclusion.type === "warning" ? "border-[#f59e0b]/40 bg-gradient-to-b from-[#2c2013]/90 to-[#1a0c00]/90"
              : "border-white/[0.08] bg-[#131926]/70"
            }`}>
              <div className="flex items-center gap-2">
                {conclusion.type === "warning"
                  ? <AlertCircle className="h-5 w-5 text-[#f59e0b]" />
                  : <CheckCircle2 className="h-5 w-5 text-[#22c55e]" />
                }
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  conclusion.type === "positive" ? "text-[#22c55e]"
                  : conclusion.type === "warning" ? "text-[#f59e0b]"
                  : "text-[#94a3b8]"
                }`}>Conclusión del sistema</span>
              </div>
              <p className="font-display font-bold text-white text-sm leading-snug">
                {conclusion.text}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
