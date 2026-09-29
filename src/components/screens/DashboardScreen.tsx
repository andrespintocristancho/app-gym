"use client";

import Link from "next/link";
import { 
  TrendingUp, TrendingDown, Dumbbell, Flame, CheckCircle2, ChevronRight, 
  Scale, Activity, Target, Sparkles
} from "lucide-react";

interface DashboardScreenProps {
  user: { name: string; email: string; };
  hasData: boolean;
  metrics: {
    weight: number;
    weightDelta: number;
    bodyFat: number;
    bodyFatDelta: number;
    muscleMass: number;
    muscleMassDelta: number;
    bmi: number;
    bmiLabel: string;
    goalPercentage: number;
    activeGoalsCount: number;
    totalWorkouts: number;
    todayCalories: number;
    todayTargetCalories: number;
    strengthScore?: number;
    strengthDeltaPct?: number;
    pressBancaPR?: number;
    pressBancaDelta?: number;
    statusText: string;
    statusDetail: string;
  };
}

function DeltaBadge({ value, unit = "kg", invert = false }: { value: number; unit?: string; invert?: boolean }) {
  if (value === 0) return <span className="text-[10px] text-[#64748b]">sin cambios</span>;
  const isGood = invert ? value < 0 : value > 0;
  return (
    <span className={`text-[10px] font-bold flex items-center gap-0.5 ${isGood ? "text-[#22c55e]" : "text-[#f43f5e]"}`}>
      {value > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {value > 0 ? "+" : ""}{value} {unit}
    </span>
  );
}

export function DashboardScreen({ user, hasData, metrics }: DashboardScreenProps) {
  const firstName = user.name ? user.name.split(" ")[0] : "Atleta";
  const calPct = metrics.todayTargetCalories > 0
    ? Math.min(100, Math.round((metrics.todayCalories / metrics.todayTargetCalories) * 100))
    : 0;

  return (
    <div className="space-y-6 pb-24 max-w-lg mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="font-display text-2xl font-black tracking-tight text-white">
            Hola, {firstName} 💪
          </h1>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            {hasData ? "Sigue firme, tu progreso inspira" : "Bienvenido al sistema de seguimiento"}
          </p>
        </div>
        <div className="relative">
          <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-[#0066ff] to-[#00d2ff] p-[2px] shadow-[0_0_20px_rgba(0,102,255,0.5)]">
            <div className="h-full w-full rounded-full bg-[#0b0f17] flex items-center justify-center">
              <span className="font-display text-2xl font-black text-[#0066ff]">
                {firstName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-[#22c55e] border-2 border-[#0b0f17]" />
        </div>
      </div>

      {/* Welcome state when no data */}
      {!hasData && (
        <div className="rounded-3xl border border-[#0066ff]/30 bg-gradient-to-b from-[#0d1829]/90 to-[#070a10]/90 p-6 text-center space-y-3">
          <Sparkles className="h-8 w-8 text-[#0066ff] mx-auto" />
          <h3 className="font-display text-lg font-bold text-white">¡Todo listo para comenzar!</h3>
          <p className="text-sm text-[#94a3b8] leading-relaxed">
            Tu entrenador registrará tus primeras medidas corporales para activar el seguimiento de progreso, gráficas y análisis automáticos.
          </p>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {["Medidas", "Nutrición", "Objetivos"].map(item => (
              <div key={item} className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                <span className="font-display text-2xl font-black text-[#64748b]">0</span>
                <p className="text-[10px] text-[#64748b] mt-0.5">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goal Ring Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#131926]/90 via-[#0d131f]/90 to-[#070a10]/95 p-6 backdrop-blur-2xl shadow-2xl flex flex-col items-center">
        <div className="absolute -top-12 h-40 w-40 rounded-full bg-[#0066ff]/15 blur-3xl pointer-events-none" />
        
        {/* SVG Ring */}
        <div className="relative flex items-center justify-center my-2">
          <svg className="w-44 h-44 transform -rotate-90">
            <circle cx="88" cy="88" r="74" stroke="#1a2233" strokeWidth="12" fill="transparent" />
            <circle
              cx="88" cy="88" r="74"
              stroke="url(#goalGrad)" strokeWidth="12"
              strokeDasharray={2 * Math.PI * 74}
              strokeDashoffset={2 * Math.PI * 74 * (1 - metrics.goalPercentage / 100)}
              strokeLinecap="round" fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="goalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0066ff" />
                <stop offset="100%" stopColor="#00d2ff" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute text-center flex flex-col items-center justify-center">
            <span className="font-display text-4xl font-black text-white tracking-tight">
              {metrics.goalPercentage}%
            </span>
            <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider mt-0.5">
              Objetivo
            </span>
          </div>
        </div>

        <div className="text-center">
          <h3 className="font-display text-base font-bold text-white">{metrics.statusText}</h3>
          <p className="text-xs text-[#64748b] mt-0.5">{metrics.statusDetail}</p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Weight */}
        <Link href="/dashboard/composition" className="rounded-2xl border border-white/[0.08] bg-[#131926]/70 p-4 backdrop-blur-xl shadow-md hover:border-[#0066ff]/40 transition-all">
          <div className="flex items-center gap-1.5 mb-2">
            <Scale className="h-4 w-4 text-[#00d2ff]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">Peso</span>
          </div>
          <p className="font-display text-2xl font-black text-white">
            {hasData ? `${metrics.weight}` : "–"}
            <span className="text-sm font-normal text-[#94a3b8] ml-1">kg</span>
          </p>
          <DeltaBadge value={metrics.weightDelta} unit="kg" />
        </Link>

        {/* Body Fat */}
        <Link href="/dashboard/composition" className="rounded-2xl border border-white/[0.08] bg-[#131926]/70 p-4 backdrop-blur-xl shadow-md hover:border-[#f43f5e]/40 transition-all">
          <div className="flex items-center gap-1.5 mb-2">
            <Activity className="h-4 w-4 text-[#f43f5e]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">Grasa</span>
          </div>
          <p className="font-display text-2xl font-black text-white">
            {hasData ? `${metrics.bodyFat}` : "–"}
            <span className="text-sm font-normal text-[#94a3b8] ml-1">%</span>
          </p>
          <DeltaBadge value={metrics.bodyFatDelta} unit="%" invert={true} />
        </Link>

        {/* Muscle Mass */}
        <Link href="/dashboard/evolution" className="rounded-2xl border border-white/[0.08] bg-[#131926]/70 p-4 backdrop-blur-xl shadow-md hover:border-[#22c55e]/40 transition-all">
          <div className="flex items-center gap-1.5 mb-2">
            <Dumbbell className="h-4 w-4 text-[#22c55e]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">Músculo</span>
          </div>
          <p className="font-display text-2xl font-black text-white">
            {hasData ? `${metrics.muscleMass}` : "–"}
            <span className="text-sm font-normal text-[#94a3b8] ml-1">kg</span>
          </p>
          {metrics.muscleMassDelta !== 0
            ? <DeltaBadge value={metrics.muscleMassDelta} unit="kg" />
            : <span className="text-[10px] text-[#64748b]">{hasData ? "sin cambios" : "–"}</span>
          }
        </Link>

        {/* Today Calories */}
        <Link href="/dashboard/nutrition" className="rounded-2xl border border-white/[0.08] bg-[#131926]/70 p-4 backdrop-blur-xl shadow-md hover:border-[#f59e0b]/40 transition-all">
          <div className="flex items-center gap-1.5 mb-2">
            <Flame className="h-4 w-4 text-[#f59e0b]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">Calorías hoy</span>
          </div>
          <p className="font-display text-2xl font-black text-white">
            {metrics.todayCalories}
            <span className="text-sm font-normal text-[#94a3b8] ml-1">kcal</span>
          </p>
          {metrics.todayTargetCalories > 0 ? (
            <div className="mt-1 h-1 w-full rounded-full bg-[#080d16] overflow-hidden">
              <div className="h-full rounded-full bg-[#f59e0b]" style={{ width: `${calPct}%` }} />
            </div>
          ) : (
            <span className="text-[10px] text-[#64748b]">sin meta asignada</span>
          )}
        </Link>
      </div>

      {/* Strength & Training Interconnection Card */}
      {((metrics.strengthScore ?? 0) > 0 || (metrics.pressBancaPR ?? 0) > 0) && (
        <Link 
          href="/dashboard/workouts"
          className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#0066ff]/10 via-[#0d131f]/80 to-[#00d2ff]/10 border border-[#0066ff]/30 hover:border-[#0066ff] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#0066ff]/20 flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-[#00d2ff]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#00d2ff]">
                  Indicador de Fuerza Ecosistema
                </span>
                {(metrics.strengthDeltaPct ?? 0) > 0 && (
                  <span className="text-[10px] font-bold text-[#22c55e] bg-[#22c55e]/10 px-1.5 py-0.5 rounded-full">
                    +{metrics.strengthDeltaPct}%
                  </span>
                )}
              </div>
              <p className="text-xs text-white font-medium mt-0.5">
                {(metrics.pressBancaPR ?? 0) > 0 
                  ? `Press Banca PR: ${metrics.pressBancaPR} kg ${(metrics.pressBancaDelta ?? 0) > 0 ? `(+${metrics.pressBancaDelta} kg)` : ''} • Impacta hipertrofia muscular` 
                  : `Puntaje de Fuerza: ${metrics.strengthScore} pts • Registrando sobrecarga progresiva`}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-[#94a3b8]" />
        </Link>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/dashboard/workouts" className="rounded-2xl border border-white/[0.08] bg-[#131926]/70 p-3.5 text-center backdrop-blur-xl hover:border-[#0066ff]/40 transition-all">
          <span className="font-display text-2xl font-black text-white">{metrics.totalWorkouts}</span>
          <p className="text-[10px] text-[#94a3b8] mt-0.5">Entrenos</p>
        </Link>
        <Link href="/dashboard/goals" className="rounded-2xl border border-white/[0.08] bg-[#131926]/70 p-3.5 text-center backdrop-blur-xl hover:border-[#0066ff]/40 transition-all">
          <span className="font-display text-2xl font-black text-[#00d2ff]">{metrics.activeGoalsCount}</span>
          <p className="text-[10px] text-[#94a3b8] mt-0.5">Objetivos</p>
        </Link>
        <Link href="/dashboard/composition" className="rounded-2xl border border-white/[0.08] bg-[#131926]/70 p-3.5 text-center backdrop-blur-xl hover:border-[#0066ff]/40 transition-all">
          <span className="font-display text-2xl font-black text-white">{hasData ? metrics.bmi.toFixed(1) : "–"}</span>
          <p className="text-[10px] text-[#94a3b8] mt-0.5">{hasData ? metrics.bmiLabel : "IMC"}</p>
        </Link>
      </div>

      {/* Quick Nav */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#64748b] px-1">Acceso rápido</h3>
        {[
          { href: "/dashboard/ai", label: "Análisis Central IA", sub: "Predicciones y conclusiones del ecosistema", icon: Sparkles, color: "#a855f7" },
          { href: "/dashboard/evolution", label: "Evolución corporal", sub: "Gráficas de progreso", icon: TrendingUp, color: "#0066ff" },
          { href: "/dashboard/compare", label: "Comparaciones", sub: "7, 15, 30, 60 días", icon: Activity, color: "#22c55e" },
          { href: "/dashboard/goals", label: "Mis objetivos", sub: `${metrics.activeGoalsCount} activos (calculados)`, icon: Target, color: "#f59e0b" },
          { href: "/dashboard/reports", label: "Reportes Inteligentes", sub: "Diagnóstico completo y descarga", icon: CheckCircle2, color: "#10b981" },
        ].map(item => (
          <Link key={item.href} href={item.href} className="flex items-center justify-between p-3.5 rounded-2xl bg-[#131926]/70 border border-white/[0.05] hover:border-[#0066ff]/30 transition-all group">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
                <item.icon className="h-4 w-4" style={{ color: item.color }} />
              </div>
              <div>
                <span className="font-bold text-white text-sm group-hover:text-[#00d2ff] transition-colors">{item.label}</span>
                <p className="text-[10px] text-[#64748b]">{item.sub}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-[#64748b] group-hover:translate-x-1 transition-transform" />
          </Link>
        ))}
      </div>
    </div>
  );
}
