"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from "recharts";

interface Measurement {
  date: Date | string;
  weight?: number | null;
  leanMass?: number | null;
  bodyFat?: number | null;
}

interface EvolutionScreenProps {
  measurements: Measurement[];
}

const MONTH_LABELS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function buildChartData(measurements: Measurement[], key: "weight" | "leanMass" | "bodyFat") {
  if (!measurements || measurements.length === 0) return [];

  return measurements
    .filter(m => m[key] != null)
    .map(m => ({
      month: MONTH_LABELS[new Date(m.date).getMonth()] + " " + new Date(m.date).getDate(),
      val: Number(m[key])
    }));
}

export function EvolutionScreen({ measurements }: EvolutionScreenProps) {
  const [activeTab, setActiveTab] = useState<"peso" | "musculo" | "grasa">("peso");

  const keyMap = { peso: "weight", musculo: "leanMass", grasa: "bodyFat" } as const;
  const chartData = buildChartData(measurements, keyMap[activeTab]);

  const unit = activeTab === "grasa" ? "%" : "kg";
  const title = activeTab === "peso" ? "Peso Corporal" : activeTab === "musculo" ? "Masa Muscular" : "% Grasa Corporal";

  // Calculate delta between first and last reading
  let deltaStr = "–";
  let isPositive = true;
  if (chartData.length >= 2) {
    const first = chartData[0].val;
    const last = chartData[chartData.length - 1].val;
    const diff = last - first;
    isPositive = activeTab === "grasa" ? diff < 0 : diff > 0;
    deltaStr = `${diff > 0 ? "+" : ""}${diff.toFixed(1)} ${unit}`;
  }

  const latestVal = chartData.length > 0 ? chartData[chartData.length - 1].val : null;
  const oldestVal = chartData.length > 0 ? chartData[0].val : null;

  return (
    <div className="space-y-6 pb-24 max-w-lg mx-auto animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="rounded-full p-2 bg-white/5 text-[#94a3b8] hover:text-white transition">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-bold text-white">Evolución</h1>
        <div className="w-9" />
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-[#131926]/80 p-1 border border-white/[0.08] backdrop-blur-xl">
        {(["peso", "musculo", "grasa"] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === t
                ? "bg-[#0066ff] text-white shadow-[0_0_15px_rgba(0,102,255,0.6)]"
                : "text-[#94a3b8] hover:text-white"
            }`}
          >
            {t === "peso" ? "Peso" : t === "musculo" ? "Músculo" : "Grasa"}
          </button>
        ))}
      </div>

      {/* Chart Card */}
      <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#131926]/90 via-[#0d131f]/90 to-[#070a10]/95 p-6 backdrop-blur-2xl shadow-2xl space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-white">{title}</h2>
            <p className="text-xs text-[#94a3b8] mt-0.5">{chartData.length} mediciones registradas</p>
          </div>
          {chartData.length >= 2 && (
            <span className={`rounded-full px-3 py-1 text-xs font-black border ${isPositive ? "bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
              {deltaStr}
            </span>
          )}
        </div>

        {chartData.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center">
            <p className="text-[#94a3b8] text-sm">No existen registros todavía.</p>
            <p className="text-[#64748b] text-xs mt-1">Agrega medidas corporales para ver tu progreso.</p>
          </div>
        ) : (
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="neonBlueGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066ff" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#00d2ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2436" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  domain={["dataMin - 1", "dataMax + 1"]}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0b0f17", borderColor: "rgba(0,102,255,0.4)", borderRadius: "12px", color: "#fff" }}
                  formatter={(val) => [`${val} ${unit}`, title]}
                />
                <Area
                  type="monotone"
                  dataKey="val"
                  stroke="#00d2ff"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#neonBlueGlow)"
                  dot={{ fill: "#00d2ff", r: 4 }}
                  activeDot={{ r: 6, fill: "#fff", stroke: "#0066ff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Comparison Card */}
      {chartData.length >= 2 && latestVal !== null && oldestVal !== null && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#131926]/70 p-5 backdrop-blur-xl shadow-lg">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] block mb-3">Comparativa</span>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-display text-2xl font-black text-[#94a3b8]">{oldestVal} {unit}</span>
              <p className="text-[10px] text-[#64748b] mt-0.5">Inicio</p>
            </div>
            <div className="text-center">
              <span className="font-display text-2xl font-black text-white">{latestVal} {unit}</span>
              <p className="text-[10px] text-[#00d2ff] font-bold mt-0.5">Actual</p>
            </div>
            <div className="text-right">
              <span className={`font-display text-xl font-black ${isPositive ? "text-[#22c55e]" : "text-red-400"}`}>{deltaStr}</span>
              <p className={`text-[10px] font-bold mt-0.5 ${isPositive ? "text-[#22c55e]" : "text-red-400"}`}>Diferencia</p>
            </div>
          </div>
        </div>
      )}

      {/* Trend Banner */}
      {chartData.length >= 2 && (
        <div className={`rounded-2xl border p-4 backdrop-blur-xl flex items-center gap-3 shadow-lg ${isPositive ? "border-[#22c55e]/30 bg-gradient-to-r from-[#13281e]/80 to-[#101e17]/80" : "border-red-500/30 bg-gradient-to-r from-[#281313]/80 to-[#1e1010]/80"}`}>
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0 ${isPositive ? "bg-[#22c55e]/20 text-[#22c55e]" : "bg-red-500/20 text-red-400"}`}>
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isPositive ? "text-[#22c55e]" : "text-red-400"}`}>Tendencia</span>
            <p className="font-display font-bold text-white text-sm mt-0.5">
              {isPositive ? "Vas en la dirección correcta" : "Necesitas ajustar tu plan"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
