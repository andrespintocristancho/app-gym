"use client";

import { useState, useMemo } from "react";
import { 
  TrendingUp, TrendingDown, Scale, Activity, Flame, 
  Calendar, Award, Sparkles, ChevronRight, BarChart3, 
  PieChart as PieIcon, LineChart as LineIcon, Layers, Info
} from "lucide-react";
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, PieChart, Pie, Cell, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar 
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Measurement {
  id: string;
  date: Date;
  weight: number | null;
  height: number | null;
  bmi: number | null;
  bodyFat: number | null;
  leanMass: number | null;
  bmr: number | null;
  idealWeight: number | null;
  waist: number | null;
  abdomen: number | null;
  chest: number | null;
  shoulders: number | null;
  neck: number | null;
  rightArm: number | null;
  leftArm: number | null;
  rightThigh: number | null;
  leftThigh: number | null;
  rightCalf: number | null;
  leftCalf: number | null;
  clientId: string;
  client?: { user: { name: string; email: string } };
}

interface ClientOption {
  id: string;
  user: { name: string; email: string };
}

interface ProgressAnalyticsProps {
  initialMeasurements: Measurement[];
  clientsList?: ClientOption[];
  isTrainer?: boolean;
  activeClientName?: string;
}

export function ProgressAnalyticsClient({
  initialMeasurements,
  clientsList = [],
  isTrainer = false,
  activeClientName
}: ProgressAnalyticsProps) {
  const [selectedMetric, setSelectedMetric] = useState<"weight" | "bodyFat" | "leanMass" | "bmi" | "waist" | "chest" | "rightArm">("weight");
  const [timeRange, setTimeRange] = useState<"1M" | "3M" | "6M" | "ALL">("ALL");
  const [chartType, setChartType] = useState<"area" | "bar">("area");
  const [selectedClientId, setSelectedClientId] = useState<string>("ALL");

  // Filter measurements by selected client (if in trainer mode)
  const filteredByClient = useMemo(() => {
    if (!isTrainer || selectedClientId === "ALL") {
      return initialMeasurements;
    }
    return initialMeasurements.filter(m => m.clientId === selectedClientId);
  }, [initialMeasurements, selectedClientId, isTrainer]);

  // Sort chronological for charts
  const sortedMeasurements = useMemo(() => {
    return [...filteredByClient].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredByClient]);

  // Filter by TimeRange
  const displayedMeasurements = useMemo(() => {
    if (timeRange === "ALL" || sortedMeasurements.length === 0) return sortedMeasurements;
    const now = new Date();
    const months = timeRange === "1M" ? 1 : timeRange === "3M" ? 3 : 6;
    const cutoff = new Date(now.setMonth(now.getMonth() - months));
    return sortedMeasurements.filter(m => new Date(m.date) >= cutoff);
  }, [sortedMeasurements, timeRange]);

  const latest = sortedMeasurements.length > 0 ? sortedMeasurements[sortedMeasurements.length - 1] : null;
  const initial = sortedMeasurements.length > 0 ? sortedMeasurements[0] : null;

  // Metric configs
  const metricConfigs = {
    weight: { label: "Peso Corporal", unit: "kg", color: "#c3f400", desc: "Evolución de masa total" },
    bodyFat: { label: "% Grasa Corporal", unit: "%", color: "#f59e0b", desc: "Porcentaje graso estimado" },
    leanMass: { label: "Masa Magra / Muscular", unit: "kg", color: "#38bdf8", desc: "Masa libre de grasa" },
    bmi: { label: "IMC (Índice Masa)", unit: "pts", color: "#a855f7", desc: "Relación peso / altura²" },
    waist: { label: "Perímetro Cintura", unit: "cm", color: "#4edea3", desc: "Circunferencia de cintura" },
    chest: { label: "Perímetro Pecho", unit: "cm", color: "#ec4899", desc: "Circunferencia pectoral" },
    rightArm: { label: "Brazo Derecho", unit: "cm", color: "#f97316", desc: "Perímetro de bíceps" },
  };

  // Body Perimeters Radar comparison (Initial vs Current)
  const perimeterRadarData = useMemo(() => {
    if (!latest) return [];
    return [
      { subject: "Pecho", Inicial: initial?.chest || 0, Actual: latest?.chest || 0 },
      { subject: "Hombros", Inicial: initial?.shoulders || 0, Actual: latest?.shoulders || 0 },
      { subject: "Brazo D.", Inicial: initial?.rightArm || 0, Actual: latest?.rightArm || 0 },
      { subject: "Cintura", Inicial: initial?.waist || 0, Actual: latest?.waist || 0 },
      { subject: "Muslo D.", Inicial: initial?.rightThigh || 0, Actual: latest?.rightThigh || 0 },
      { subject: "Pantorrilla", Inicial: initial?.rightCalf || 0, Actual: latest?.rightCalf || 0 },
    ].filter(item => item.Actual > 0 || item.Inicial > 0);
  }, [initial, latest]);

  // Composition donut
  const compositionData = useMemo(() => {
    if (!latest?.weight || !latest?.bodyFat) return [];
    const fatKg = (latest.weight * latest.bodyFat) / 100;
    const leanKg = latest.weight - fatKg;
    return [
      { name: "Masa Magra", value: Number(leanKg.toFixed(1)), color: "#38bdf8" },
      { name: "Masa Grasa", value: Number(fatKg.toFixed(1)), color: "#f59e0b" },
    ];
  }, [latest]);

  // Delta calculations
  const calculateDelta = (key: keyof Measurement) => {
    if (!latest || !initial || latest === initial) return null;
    const curr = latest[key] as number | null;
    const init = initial[key] as number | null;
    if (curr == null || init == null) return null;
    const diff = curr - init;
    const pct = init !== 0 ? (diff / init) * 100 : 0;
    return { diff: Number(diff.toFixed(1)), pct: Number(pct.toFixed(1)) };
  };

  const weightDelta = calculateDelta("weight");
  const fatDelta = calculateDelta("bodyFat");
  const leanDelta = calculateDelta("leanMass");
  const waistDelta = calculateDelta("waist");

  return (
    <div className="space-y-8 pb-12">
      {/* Header with Trainer Client Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#c3f400]">
            <TrendingUp className="h-4 w-4" />
            <p className="text-[11px] font-bold uppercase tracking-[0.2em]">Centro de Análisis y Rendimiento</p>
          </div>
          <h1 className="mt-1 font-display text-3xl font-black text-white">
            {isTrainer ? "Analíticas y Evolución Corporal" : "Mi Progreso Físico"}
          </h1>
          <p className="text-sm text-[#aab1a1]">
            {activeClientName ? `Evolución de ${activeClientName}` : "Métricas antropométricas, composición corporal y tendencias."}
          </p>
        </div>

        {/* Client filter for trainers */}
        {isTrainer && clientsList.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#aab1a1]">Filtrar Atleta:</span>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#1c2028] px-4 py-2 text-sm font-semibold text-white focus:border-[#c3f400] focus:outline-none"
            >
              <option value="ALL">📊 Todos los Atletas (Global)</option>
              {clientsList.map(c => (
                <option key={c.id} value={c.id}>{c.user.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Metric Delta Cards Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Weight KPI */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#1c2028] p-5 shadow-lg relative overflow-hidden">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#aab1a1]">Peso Actual</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-black text-white">
              {latest?.weight ? `${latest.weight} kg` : "ND"}
            </span>
          </div>
          {weightDelta && (
            <div className={`mt-2 flex items-center gap-1 text-xs font-bold ${weightDelta.diff <= 0 ? "text-[#4edea3]" : "text-amber-400"}`}>
              {weightDelta.diff <= 0 ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
              <span>{weightDelta.diff > 0 ? `+${weightDelta.diff}` : weightDelta.diff} kg ({weightDelta.pct}%)</span>
            </div>
          )}
        </div>

        {/* Body Fat KPI */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#1c2028] p-5 shadow-lg relative overflow-hidden">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#aab1a1]">% Grasa Corporal</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-black text-amber-400">
              {latest?.bodyFat ? `${latest.bodyFat.toFixed(1)}%` : "ND"}
            </span>
          </div>
          {fatDelta && (
            <div className={`mt-2 flex items-center gap-1 text-xs font-bold ${fatDelta.diff <= 0 ? "text-[#4edea3]" : "text-rose-400"}`}>
              {fatDelta.diff <= 0 ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
              <span>{fatDelta.diff > 0 ? `+${fatDelta.diff}` : fatDelta.diff}% grasa</span>
            </div>
          )}
        </div>

        {/* Lean Mass KPI */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#1c2028] p-5 shadow-lg relative overflow-hidden">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#aab1a1]">Masa Magra / Músculo</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-black text-[#38bdf8]">
              {latest?.leanMass ? `${latest.leanMass.toFixed(1)} kg` : "ND"}
            </span>
          </div>
          {leanDelta && (
            <div className={`mt-2 flex items-center gap-1 text-xs font-bold ${leanDelta.diff >= 0 ? "text-[#4edea3]" : "text-amber-400"}`}>
              {leanDelta.diff >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              <span>{leanDelta.diff > 0 ? `+${leanDelta.diff}` : leanDelta.diff} kg magro</span>
            </div>
          )}
        </div>

        {/* Waist Perimeter KPI */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#1c2028] p-5 shadow-lg relative overflow-hidden">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#aab1a1]">Cintura</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-black text-[#4edea3]">
              {latest?.waist ? `${latest.waist} cm` : "ND"}
            </span>
          </div>
          {waistDelta && (
            <div className={`mt-2 flex items-center gap-1 text-xs font-bold ${waistDelta.diff <= 0 ? "text-[#4edea3]" : "text-amber-400"}`}>
              {waistDelta.diff <= 0 ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
              <span>{waistDelta.diff > 0 ? `+${waistDelta.diff}` : waistDelta.diff} cm</span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Main Chart Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#1c2028] p-6 shadow-xl space-y-6">
        {/* Metric Selector Pills & Timeframe Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.07] pb-5">
          {/* Metrics buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(metricConfigs) as Array<keyof typeof metricConfigs>).map((key) => {
              const cfg = metricConfigs[key];
              const isSelected = selectedMetric === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedMetric(key)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                    isSelected 
                      ? "bg-[#c3f400] text-[#161e00] shadow-[0_0_15px_-3px_rgba(195,244,0,0.6)]" 
                      : "bg-[#0a0e16] text-[#aab1a1] hover:text-white border border-white/5"
                  }`}
                >
                  <span>{cfg.label}</span>
                  <span className="text-[10px] opacity-75">({cfg.unit})</span>
                </button>
              );
            })}
          </div>

          {/* Timeframe & Chart Type Toggle */}
          <div className="flex items-center gap-3">
            {/* Chart type toggle */}
            <div className="flex items-center rounded-xl bg-[#0a0e16] p-1 border border-white/5">
              <button
                onClick={() => setChartType("area")}
                className={`p-1.5 rounded-lg text-xs transition ${chartType === "area" ? "bg-white/10 text-white" : "text-[#aab1a1]"}`}
                title="Gráfico de Área"
              >
                <LineIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setChartType("bar")}
                className={`p-1.5 rounded-lg text-xs transition ${chartType === "bar" ? "bg-white/10 text-white" : "text-[#aab1a1]"}`}
                title="Gráfico de Barras"
              >
                <BarChart3 className="h-4 w-4" />
              </button>
            </div>

            {/* TimeRange */}
            <div className="flex items-center rounded-xl bg-[#0a0e16] p-1 border border-white/5">
              {(["1M", "3M", "6M", "ALL"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    timeRange === t ? "bg-[#c3f400] text-[#161e00]" : "text-[#aab1a1] hover:text-white"
                  }`}
                >
                  {t === "ALL" ? "Todo" : t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-80 w-full">
          {displayedMeasurements.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center text-sm text-[#aab1a1]">
              No hay mediciones registradas para el rango seleccionado.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "area" ? (
                <AreaChart data={displayedMeasurements} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={metricConfigs[selectedMetric].color} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={metricConfigs[selectedMetric].color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262a33" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6f786d" 
                    fontSize={11} 
                    tickLine={false}
                    tickFormatter={(val) => format(new Date(val), "d MMM", { locale: es })}
                  />
                  <YAxis 
                    stroke="#6f786d" 
                    fontSize={11} 
                    tickLine={false}
                    domain={['dataMin - 2', 'dataMax + 2']}
                    tickFormatter={(val) => `${val}${metricConfigs[selectedMetric].unit}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0e16', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                    labelFormatter={(val) => format(new Date(val as string), "PPP", { locale: es })}
                    formatter={(val) => [`${val} ${metricConfigs[selectedMetric].unit}`, metricConfigs[selectedMetric].label]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={selectedMetric} 
                    name={metricConfigs[selectedMetric].label} 
                    stroke={metricConfigs[selectedMetric].color} 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#metricGradient)" 
                    dot={{ fill: metricConfigs[selectedMetric].color, r: 4 }}
                    activeDot={{ r: 6, fill: '#fff' }}
                  />
                </AreaChart>
              ) : (
                <BarChart data={displayedMeasurements} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262a33" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6f786d" 
                    fontSize={11} 
                    tickLine={false}
                    tickFormatter={(val) => format(new Date(val), "d MMM", { locale: es })}
                  />
                  <YAxis 
                    stroke="#6f786d" 
                    fontSize={11} 
                    tickLine={false}
                    domain={['dataMin - 2', 'dataMax + 2']}
                    tickFormatter={(val) => `${val}${metricConfigs[selectedMetric].unit}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0e16', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                    labelFormatter={(val) => format(new Date(val as string), "PPP", { locale: es })}
                    formatter={(val) => [`${val} ${metricConfigs[selectedMetric].unit}`, metricConfigs[selectedMetric].label]}
                  />
                  <Bar 
                    dataKey={selectedMetric} 
                    name={metricConfigs[selectedMetric].label} 
                    fill={metricConfigs[selectedMetric].color} 
                    radius={[6, 6, 0, 0]} 
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Advanced Dual Charts: Perimeters Radar + Body Composition Donut */}
      {latest && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart for Perimeters */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#1c2028] p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#c3f400]">
                <Layers className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Simetría y Perímetros</span>
              </div>
              <h3 className="font-display text-lg font-bold text-white mt-1">Comparativa de Medidas Corporales</h3>
              <p className="text-xs text-[#aab1a1]">Evolución del perímetro inicial vs actual (cm).</p>
            </div>

            <div className="h-72 w-full my-3">
              {perimeterRadarData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-xs text-[#aab1a1]">
                  Se requieren más registros de perímetros para generar el radar.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={perimeterRadarData}>
                    <PolarGrid stroke="#262a33" />
                    <PolarAngleAxis dataKey="subject" stroke="#aab1a1" fontSize={11} />
                    <PolarRadiusAxis stroke="#6f786d" fontSize={9} />
                    <Radar name="Medida Inicial" dataKey="Inicial" stroke="#64748b" fill="#64748b" fillOpacity={0.3} />
                    <Radar name="Medida Actual" dataKey="Actual" stroke="#c3f400" fill="#c3f400" fillOpacity={0.5} />
                    <Legend wrapperStyle={{ fontSize: '11px', color: '#aab1a1' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0e16', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                      formatter={(val) => [`${val} cm`]}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="pt-3 border-t border-white/[0.07] flex items-center justify-between text-xs text-[#aab1a1]">
              <span>Puntos analizados: {perimeterRadarData.length} grupos</span>
              <span className="text-[#c3f400] font-semibold">Técnica Antropométrica</span>
            </div>
          </div>

          {/* Composition Donut & Metabolic Rates */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#1c2028] p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#38bdf8]">
                <PieIcon className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Composición Tisular</span>
              </div>
              <h3 className="font-display text-lg font-bold text-white mt-1">Desglose Grasa vs Músculo</h3>
              <p className="text-xs text-[#aab1a1]">Distribución actual de masa corporal.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 my-2">
              <div className="h-56 w-full">
                {compositionData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-xs text-[#aab1a1]">
                    Faltan datos de % grasa.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={compositionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {compositionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0a0e16', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                        formatter={(val) => [`${val} kg`]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="space-y-3">
                {compositionData.map(item => (
                  <div key={item.name} className="p-3 rounded-xl bg-[#0a0e16] border border-white/5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#aab1a1] flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </span>
                      <span className="font-bold text-white">{item.value} kg</span>
                    </div>
                  </div>
                ))}

                {latest.bmr && (
                  <div className="p-3 rounded-xl bg-[#0a0e16] border border-white/5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#aab1a1]">Tasa Metabólica Basal</span>
                      <span className="font-bold text-[#c3f400]">{Math.round(latest.bmr)} kcal/día</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.07] flex items-center justify-between text-xs text-[#aab1a1]">
              <span>Peso Ideal Calculado: {latest.idealWeight ? `${latest.idealWeight.toFixed(1)} kg` : "ND"}</span>
              <span className="text-[#38bdf8] font-semibold">Fórmula Harris-Benedict</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
