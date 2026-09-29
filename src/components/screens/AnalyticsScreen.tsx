"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ChevronLeft, TrendingUp, TrendingDown, Sparkles, 
  Layers, Flame, Award, Activity, Calendar, Dumbbell,
  Target, Info, CheckCircle2, AlertCircle
} from "lucide-react";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";

export interface AnalyticsMeasurement {
  date: string;
  weight?: number | null;
  leanMass?: number | null;
  bodyFat?: number | null;
  chest?: number | null;
  rightArm?: number | null;
  waist?: number | null;
  rightThigh?: number | null;
  rightCalf?: number | null;
}

export interface AnalyticsWorkoutSession {
  date: string;
  durationMin?: number | null;
}

interface AnalyticsScreenProps {
  measurements?: AnalyticsMeasurement[];
  workoutSessions?: AnalyticsWorkoutSession[];
  ecosystem?: any;
}

export function AnalyticsScreen({ 
  measurements = [], 
  workoutSessions = [],
  ecosystem
}: AnalyticsScreenProps) {
  const [activeTab, setActiveTab] = useState<"evolutivas" | "comparativas" | "radar" | "proyeccion" | "actividad">("evolutivas");

  const hasData = measurements.length > 0;
  const hasHistory = measurements.length >= 2;

  const latest = hasData ? measurements[measurements.length - 1] : null;
  const previous = hasHistory ? measurements[measurements.length - 2] : null;
  const first = hasData ? measurements[0] : null;

  // 1. Evolución Timeline data
  const timelineData = measurements.map(m => ({
    fecha: new Date(m.date).toLocaleDateString("es-CO", { day: "numeric", month: "short" }),
    peso: m.weight ?? null,
    musculo: m.leanMass ?? null,
    grasa: m.bodyFat ?? null,
  }));

  // 2. Mes actual vs Mes anterior
  const now = new Date();
  const currentMonthNum = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthMeasurements = measurements.filter(m => {
    const d = new Date(m.date);
    return d.getMonth() === currentMonthNum && d.getFullYear() === currentYear;
  });

  const prevMonthMeasurements = measurements.filter(m => {
    const d = new Date(m.date);
    const targetMonth = currentMonthNum === 0 ? 11 : currentMonthNum - 1;
    const targetYear = currentMonthNum === 0 ? currentYear - 1 : currentYear;
    return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
  });

  const avg = (arr: AnalyticsMeasurement[], key: keyof AnalyticsMeasurement) => {
    const valid = arr.map(m => m[key] as number).filter(v => typeof v === "number" && !isNaN(v));
    if (valid.length === 0) return 0;
    return Number((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(1));
  };

  const monthlyComparisonData = [
    { metrica: "Peso", anterior: avg(prevMonthMeasurements, "weight") || (previous?.weight ?? 0), actual: avg(currentMonthMeasurements, "weight") || (latest?.weight ?? 0) },
    { metrica: "Músculo", anterior: avg(prevMonthMeasurements, "leanMass") || (previous?.leanMass ?? 0), actual: avg(currentMonthMeasurements, "leanMass") || (latest?.leanMass ?? 0) },
    { metrica: "Grasa", anterior: avg(prevMonthMeasurements, "bodyFat") || (previous?.bodyFat ?? 0), actual: avg(currentMonthMeasurements, "bodyFat") || (latest?.bodyFat ?? 0) },
    { metrica: "Cintura", anterior: avg(prevMonthMeasurements, "waist") || (previous?.waist ?? 0), actual: avg(currentMonthMeasurements, "waist") || (latest?.waist ?? 0) },
    { metrica: "Pecho", anterior: avg(prevMonthMeasurements, "chest") || (previous?.chest ?? 0), actual: avg(currentMonthMeasurements, "chest") || (latest?.chest ?? 0) },
  ];

  // 3. Radar Chart data (Normalized based on latest measurements)
  const radarData = latest ? [
    { subject: "Pecho", valor: latest.chest ? Math.min(100, Math.round((latest.chest / 120) * 100)) : 0, real: `${latest.chest ?? 0} cm` },
    { subject: "Brazo", valor: latest.rightArm ? Math.min(100, Math.round((latest.rightArm / 48) * 100)) : 0, real: `${latest.rightArm ?? 0} cm` },
    { subject: "Cintura", valor: latest.waist ? Math.max(0, 100 - Math.round((latest.waist / 110) * 100)) : 0, real: `${latest.waist ?? 0} cm` },
    { subject: "Muslo", valor: latest.rightThigh ? Math.min(100, Math.round((latest.rightThigh / 70) * 100)) : 0, real: `${latest.rightThigh ?? 0} cm` },
    { subject: "Pantorrilla", valor: latest.rightCalf ? Math.min(100, Math.round((latest.rightCalf / 46) * 100)) : 0, real: `${latest.rightCalf ?? 0} cm` },
    { subject: "Peso", valor: latest.weight ? Math.min(100, Math.round((latest.weight / 100) * 100)) : 0, real: `${latest.weight ?? 0} kg` },
  ] : [];

  // 4. Proyección a 30 días
  const projectionData = (() => {
    if (!hasHistory || !latest?.weight || !first?.weight) return [];
    const daysBetween = Math.max(1, Math.round((new Date(latest.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24)));
    const dailyRate = (latest.weight - first.weight) / daysBetween;
    const projectedWeight = Number((latest.weight + dailyRate * 30).toFixed(1));

    return [
      { etapa: "Inicial", peso: first.weight },
      { etapa: "Actual", peso: latest.weight },
      { etapa: "Proyección +30d", peso: projectedWeight },
    ];
  })();

  // 5. Heatmap de actividad (últimas 6 semanas)
  const activityDays = Array.from({ length: 42 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (41 - i));
    d.setHours(0, 0, 0, 0);
    const nextD = new Date(d);
    nextD.setDate(nextD.getDate() + 1);

    const count = workoutSessions.filter(w => {
      const wd = new Date(w.date);
      return wd >= d && wd < nextD;
    }).length;

    return {
      date: d.toISOString().split("T")[0],
      count,
      dayOfWeek: d.getDay(),
    };
  });

  // Automated AI Explanations
  const getWeightAiText = () => {
    if (!hasHistory || !latest?.weight || !previous?.weight) return "Registra más mediciones para calcular la tendencia del peso corporal.";
    const diff = Number((latest.weight - previous.weight).toFixed(1));
    if (diff > 0) return `Tu peso aumentó ${diff} kg durante las últimas mediciones.`;
    if (diff < 0) return `Tu peso disminuyó ${Math.abs(diff)} kg respecto a la medición anterior.`;
    return "Tu peso corporal se ha mantenido completamente estable.";
  };

  const getFatAiText = () => {
    if (!hasHistory || !latest?.bodyFat || !previous?.bodyFat) return "Registra el porcentaje de grasa en al menos dos mediciones para el análisis automático.";
    const diff = Number((latest.bodyFat - previous.bodyFat).toFixed(1));
    if (diff < 0) return `Tu porcentaje de grasa disminuyó ${Math.abs(diff)}% respecto a la medición anterior.`;
    if (diff > 0) return `Tu porcentaje de grasa mostró un incremento de ${diff}%.`;
    return "El porcentaje de grasa se mantiene sin variaciones.";
  };

  const getMuscleAiText = () => {
    if (!hasHistory || !latest?.leanMass || !previous?.leanMass) return "La masa muscular requiere más registros para proyectar su evolución.";
    const diff = Number((latest.leanMass - previous.leanMass).toFixed(1));
    if (diff > 0) return `Tu masa muscular muestra una tendencia positiva con un incremento de +${diff} kg.`;
    if (diff < 0) return `Tu masa muscular registró una ligera disminución de ${Math.abs(diff)} kg.`;
    return "Tu masa muscular se mantiene preservada de forma constante.";
  };

  const getProjectionAiText = () => {
    if (projectionData.length < 3) return "Se requieren al menos 2 mediciones separadas en el tiempo para proyectar la tendencia futura.";
    const start = projectionData[1].peso;
    const end = projectionData[2].peso;
    const diff = Number((end - start).toFixed(1));
    if (diff > 0) return `A este ritmo de progreso, tu peso proyectado en 30 días será de aproximadamente ${end} kg (+${diff} kg).`;
    if (diff < 0) return `Si continúas con tu disciplina actual, tu peso proyectado en 30 días será de aproximadamente ${end} kg (-${Math.abs(diff)} kg).`;
    return `Tu tendencia actual proyecta un mantenimiento exacto de peso (${end} kg) para los próximos 30 días.`;
  };

  const getActivityAiText = () => {
    const total = workoutSessions.length;
    if (total === 0) return "Aún no registras entrenamientos. Inicia tus sesiones en el módulo de entrenamientos.";
    return `Has completado un total de ${total} sesiones de entrenamiento registradas en el sistema.`;
  };

  return (
    <div className="space-y-6 pb-24 max-w-lg mx-auto animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="rounded-full p-2 bg-white/5 text-[#94a3b8] hover:text-white transition">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-bold text-white">Gráficas Profesionales</h1>
        <div className="w-9" />
      </div>

      {/* 4 Pilares Interconectados */}
      {ecosystem && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c1421]/90 p-4 space-y-2 backdrop-blur-xl">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#00d2ff]" /> Ecosistema Conectado
            </span>
            <span className="text-[10px] font-bold text-[#22c55e]">
              {ecosystem.aiAnalysis.statusTitle}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-1 text-center">
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[9px] uppercase font-bold text-[#94a3b8] block">Medidas</span>
              <strong className="text-xs text-white block mt-0.5">{latest?.weight ?? "–"} kg</strong>
              <span className="text-[9px] text-[#00d2ff]">Cintura: {latest?.waist ?? "–"}</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[9px] uppercase font-bold text-[#94a3b8] block">Fuerza</span>
              <strong className="text-xs text-emerald-400 block mt-0.5">{ecosystem.workoutSummary.strengthScore} Pts</strong>
              <span className="text-[9px] text-slate-400">{workoutSessions.length} entrenos</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[9px] uppercase font-bold text-[#94a3b8] block">Dieta</span>
              <strong className="text-xs text-amber-400 block mt-0.5">{ecosystem.nutritionSummary.todayCalories}</strong>
              <span className="text-[9px] text-slate-400">/{ecosystem.nutritionSummary.targetCalories || "–"} kcal</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/5">
              <span className="text-[9px] uppercase font-bold text-[#94a3b8] block">Fotos</span>
              <strong className="text-xs text-purple-400 block mt-0.5">{ecosystem.photosSummary.count}</strong>
              <span className="text-[9px] text-slate-400">hitos</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex rounded-2xl bg-[#131926]/80 p-1 border border-white/[0.08] backdrop-blur-xl overflow-x-auto gap-1">
        {[
          { id: "evolutivas", label: "Evolución" },
          { id: "comparativas", label: "Comparativa" },
          { id: "radar", label: "Radar" },
          { id: "proyeccion", label: "Proyección" },
          { id: "actividad", label: "Actividad" },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
              activeTab === t.id
                ? "bg-[#0066ff] text-white shadow-[0_0_15px_rgba(0,102,255,0.6)]"
                : "text-[#94a3b8] hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!hasData ? (
        <div className="rounded-3xl border border-white/[0.08] bg-[#131926]/70 p-8 text-center space-y-4">
          <Activity className="h-12 w-12 text-[#64748b] mx-auto opacity-50" />
          <h3 className="font-display text-base font-bold text-white">Sin datos suficientes</h3>
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            Se requieren mediciones registradas por tu entrenador para trazar las gráficas evolutivas, el radar corporal y las proyecciones inteligentes.
          </p>
          <Link
            href="/dashboard/measurements"
            className="inline-block rounded-2xl bg-[#0066ff] px-5 py-3 text-xs font-bold text-white"
          >
            Ver medidas corporales
          </Link>
        </div>
      ) : activeTab === "evolutivas" ? (
        <div className="space-y-6">
          {/* 1. Línea Evolutiva Peso */}
          <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#131926]/90 to-[#070a10]/95 p-5 backdrop-blur-2xl shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00d2ff]">1. Evolución</span>
                <h3 className="font-display text-base font-bold text-white">Peso Corporal (kg)</h3>
              </div>
              <span className="font-display text-lg font-black text-white">{latest?.weight ?? 0} kg</span>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2436" vertical={false} />
                  <XAxis dataKey="fecha" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip contentStyle={{ backgroundColor: '#0b0f17', borderColor: '#0066ff', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="peso" stroke="#0066ff" strokeWidth={2.5} fill="#0066ff" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* AI Explanation */}
            <div className="rounded-2xl border border-[#0066ff]/20 bg-[#0066ff]/5 p-3 flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-[#00d2ff] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#cbd5e1] leading-relaxed">
                <strong>Análisis IA:</strong> {getWeightAiText()}
              </p>
            </div>
          </div>

          {/* 2. Línea Evolutiva Masa Muscular */}
          <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#131926]/90 to-[#070a10]/95 p-5 backdrop-blur-2xl shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#22c55e]">2. Evolución</span>
                <h3 className="font-display text-base font-bold text-white">Masa Muscular Magra (kg)</h3>
              </div>
              <span className="font-display text-lg font-black text-[#22c55e]">{latest?.leanMass ?? 0} kg</span>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2436" vertical={false} />
                  <XAxis dataKey="fecha" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip contentStyle={{ backgroundColor: '#0b0f17', borderColor: '#22c55e', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="musculo" stroke="#22c55e" strokeWidth={2.5} fill="#22c55e" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* AI Explanation */}
            <div className="rounded-2xl border border-[#22c55e]/20 bg-[#22c55e]/5 p-3 flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-[#22c55e] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#cbd5e1] leading-relaxed">
                <strong>Análisis IA:</strong> {getMuscleAiText()}
              </p>
            </div>
          </div>

          {/* 3. Línea Evolutiva Grasa Corporal */}
          <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#131926]/90 to-[#070a10]/95 p-5 backdrop-blur-2xl shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#f43f5e]">3. Evolución</span>
                <h3 className="font-display text-base font-bold text-white">% Grasa Corporal</h3>
              </div>
              <span className="font-display text-lg font-black text-[#f43f5e]">{latest?.bodyFat ?? 0} %</span>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2436" vertical={false} />
                  <XAxis dataKey="fecha" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip contentStyle={{ backgroundColor: '#0b0f17', borderColor: '#f43f5e', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="grasa" stroke="#f43f5e" strokeWidth={2.5} fill="#f43f5e" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* AI Explanation */}
            <div className="rounded-2xl border border-[#f43f5e]/20 bg-[#f43f5e]/5 p-3 flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-[#f43f5e] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#cbd5e1] leading-relaxed">
                <strong>Análisis IA:</strong> {getFatAiText()}
              </p>
            </div>
          </div>
        </div>
      ) : activeTab === "comparativas" ? (
        /* 4. Barras comparativas */
        <div className="space-y-4">
          <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#131926]/90 to-[#070a10]/95 p-5 backdrop-blur-2xl shadow-xl space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#00d2ff]">4. Comparativa Mensual</span>
              <h3 className="font-display text-base font-bold text-white">Periodo Anterior vs Periodo Actual</h3>
              <p className="text-xs text-[#94a3b8] mt-0.5">Comparación directa de indicadores corporales clave</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2436" vertical={false} />
                  <XAxis dataKey="metrica" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0b0f17', borderColor: '#0066ff', borderRadius: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="anterior" name="Periodo Anterior" fill="#64748b" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="actual" name="Periodo Actual" fill="#0066ff" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* AI Explanation */}
            <div className="rounded-2xl border border-[#0066ff]/20 bg-[#0066ff]/5 p-3 flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-[#00d2ff] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#cbd5e1] leading-relaxed">
                <strong>Análisis IA:</strong> La comparativa entre periodos muestra la adaptación fisiológica acumulada. Mantener la reducción en cintura junto al aumento o preservación de pecho y masa magra ratifica una recomposición exitosa.
              </p>
            </div>
          </div>
        </div>
      ) : activeTab === "radar" ? (
        /* 5. Gráfico Radar */
        <div className="space-y-4">
          <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#131926]/90 to-[#070a10]/95 p-5 backdrop-blur-2xl shadow-xl space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#00d2ff]">5. Proporción Antropométrica</span>
              <h3 className="font-display text-base font-bold text-white">Gráfico Radar Corporal</h3>
              <p className="text-xs text-[#94a3b8] mt-0.5">Equilibrio estético y simetría de perímetros</p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1a2436" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                  <PolarRadiusAxis stroke="#64748b" fontSize={9} />
                  <Radar name="Simetría" dataKey="valor" stroke="#00d2ff" fill="#0066ff" fillOpacity={0.4} />
                  <Tooltip contentStyle={{ backgroundColor: '#0b0f17', borderColor: '#00d2ff', borderRadius: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* AI Explanation */}
            <div className="rounded-2xl border border-[#0066ff]/20 bg-[#0066ff]/5 p-3 flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-[#00d2ff] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#cbd5e1] leading-relaxed">
                <strong>Análisis IA:</strong> El radar evalúa el equilibrio entre tren superior, cintura y tren inferior. Tu estructura actual destaca por una proporción V-taper con buen soporte de base muscular.
              </p>
            </div>
          </div>
        </div>
      ) : activeTab === "proyeccion" ? (
        /* 6. Gráfico de Tendencia */
        <div className="space-y-4">
          <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#131926]/90 to-[#070a10]/95 p-5 backdrop-blur-2xl shadow-xl space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#22c55e]">6. Tendencia Predictiva</span>
              <h3 className="font-display text-base font-bold text-white">Proyección Próximos 30 Días</h3>
              <p className="text-xs text-[#94a3b8] mt-0.5">Estimación matemática basada en la tasa de cambio real</p>
            </div>

            {projectionData.length < 3 ? (
              <p className="text-xs text-[#64748b] py-6 text-center">Se requieren más registros para proyectar.</p>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2436" vertical={false} />
                    <XAxis dataKey="etapa" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip contentStyle={{ backgroundColor: '#0b0f17', borderColor: '#22c55e', borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="peso" stroke="#22c55e" strokeWidth={3} strokeDasharray="5 5" dot={{ fill: '#22c55e', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* AI Explanation */}
            <div className="rounded-2xl border border-[#22c55e]/20 bg-[#22c55e]/5 p-3 flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-[#22c55e] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#cbd5e1] leading-relaxed">
                <strong>Análisis IA:</strong> {getProjectionAiText()}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* 7. Heatmap de actividad */
        <div className="space-y-4">
          <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#131926]/90 to-[#070a10]/95 p-5 backdrop-blur-2xl shadow-xl space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#00d2ff]">7. Constancia</span>
              <h3 className="font-display text-base font-bold text-white">Heatmap de Entrenamiento</h3>
              <p className="text-xs text-[#94a3b8] mt-0.5">Últimas 6 semanas de frecuencia en el gimnasio</p>
            </div>

            <div className="grid grid-cols-7 gap-1.5 p-2 bg-[#080d16] rounded-2xl border border-white/5">
              {activityDays.map((d, i) => (
                <div
                  key={i}
                  title={`${d.date}: ${d.count} entrenos`}
                  className={`h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                    d.count > 0 
                      ? "bg-[#0066ff] text-white shadow-[0_0_8px_rgba(0,102,255,0.6)]" 
                      : "bg-white/5 text-[#475569]"
                  }`}
                >
                  {d.count > 0 ? "✓" : ""}
                </div>
              ))}
            </div>

            {/* AI Explanation */}
            <div className="rounded-2xl border border-[#0066ff]/20 bg-[#0066ff]/5 p-3 flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-[#00d2ff] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#cbd5e1] leading-relaxed">
                <strong>Análisis IA:</strong> {getActivityAiText()} La consistencia semanal es el factor primordial que determina los resultados en la composición corporal.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 8. Dashboard Ejecutivo (Resumen corporal completo) */}
      {hasData && (
        <div className="rounded-3xl border border-white/[0.08] bg-[#131926]/70 p-5 backdrop-blur-xl shadow-xl space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block">8. Dashboard Ejecutivo</span>
          <h4 className="font-display text-sm font-bold text-white">Resumen Corporal Completo</h4>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#080d16] border border-white/5 flex justify-between">
              <span className="text-[#94a3b8]">Peso:</span>
              <strong className="text-white">{latest?.weight ?? "–"} kg</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#080d16] border border-white/5 flex justify-between">
              <span className="text-[#94a3b8]">Masa Magra:</span>
              <strong className="text-[#22c55e]">{latest?.leanMass ?? "–"} kg</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#080d16] border border-white/5 flex justify-between">
              <span className="text-[#94a3b8]">Grasa:</span>
              <strong className="text-[#f43f5e]">{latest?.bodyFat ?? "–"} %</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#080d16] border border-white/5 flex justify-between">
              <span className="text-[#94a3b8]">Cintura:</span>
              <strong className="text-white">{latest?.waist ?? "–"} cm</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#080d16] border border-white/5 flex justify-between">
              <span className="text-[#94a3b8]">Pecho:</span>
              <strong className="text-white">{latest?.chest ?? "–"} cm</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#080d16] border border-white/5 flex justify-between">
              <span className="text-[#94a3b8]">Brazo:</span>
              <strong className="text-white">{latest?.rightArm ?? "–"} cm</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
