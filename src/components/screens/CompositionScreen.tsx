"use client";

import Link from "next/link";
import { ChevronLeft, CheckCircle2, AlertCircle, Info } from "lucide-react";

interface CompositionScreenProps {
  latestMeasurement?: {
    weight?: number;
    height?: number;
    bodyFat?: number;
    leanMass?: number;
    bmi?: number;
    bmr?: number;
    idealWeight?: number;
    date?: string;
  };
}

function getBmiLabel(bmi: number): string {
  if (bmi < 18.5) return "Bajo peso";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Sobrepeso";
  return "Obesidad";
}

function getBmiColor(label: string): string {
  if (label === "Normal") return "#22c55e";
  if (label === "Bajo peso") return "#38bdf8";
  if (label === "Sobrepeso") return "#f59e0b";
  return "#f43f5e";
}

export function CompositionScreen({ latestMeasurement }: CompositionScreenProps) {
  if (!latestMeasurement) {
    return (
      <div className="space-y-6 pb-24 max-w-lg mx-auto animate-fadeIn">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="rounded-full p-2 bg-white/5 text-[#94a3b8] hover:text-white transition">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-xl font-bold text-white">Mi Composición</h1>
          <div className="w-9" />
        </div>
        <div className="rounded-3xl border border-white/[0.08] bg-[#131926]/70 p-8 text-center space-y-4">
          <Info className="h-10 w-10 text-[#64748b] mx-auto opacity-50" />
          <h3 className="font-bold text-white">Sin datos de composición corporal</h3>
          <p className="text-sm text-[#64748b]">
            Tu entrenador aún no ha registrado tus medidas corporales. Cuando lo haga, verás aquí tu análisis completo de composición: grasa corporal, masa muscular, IMC, metabolismo basal y más.
          </p>
        </div>
      </div>
    );
  }

  const { weight, height, bodyFat, leanMass, bmi, bmr, idealWeight, date } = latestMeasurement;
  const bmiLabel = bmi ? getBmiLabel(bmi) : "–";
  const bmiColor = bmi ? getBmiColor(bmiLabel) : "#64748b";
  const maintenanceCalories = bmr ? Math.round(bmr * 1.55) : null;
  const fatPct = bodyFat ?? 0;
  const circumference = 2 * Math.PI * 74;
  const dashOffset = circumference * (1 - Math.min(fatPct, 40) / 40);

  const idealRange = idealWeight
    ? `${(idealWeight - 3).toFixed(1)} – ${(idealWeight + 3).toFixed(1)} kg`
    : "–";

  const isHealthy = bmiLabel === "Normal";

  return (
    <div className="space-y-6 pb-24 max-w-lg mx-auto animate-fadeIn">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="rounded-full p-2 bg-white/5 text-[#94a3b8] hover:text-white transition">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-bold text-white">Mi Composición</h1>
        <div className="w-9" />
      </div>

      {date && (
        <p className="text-[11px] text-center text-[#64748b]">
          Última medición: {new Date(date).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      )}

      {/* Circular Gauge */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#131926]/90 via-[#0d131f]/90 to-[#070a10]/95 p-6 backdrop-blur-2xl shadow-2xl flex flex-col items-center">
        <div className="absolute -top-10 h-36 w-36 rounded-full bg-[#f43f5e]/15 blur-3xl pointer-events-none" />
        <div className="relative flex items-center justify-center my-3">
          <svg className="w-44 h-44 transform -rotate-90">
            <circle cx="88" cy="88" r="74" stroke="#1a2233" strokeWidth="12" fill="transparent" />
            <circle
              cx="88" cy="88" r="74"
              stroke="url(#fatGradient)" strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round" fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="fatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#fb7185" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute text-center flex flex-col items-center justify-center">
            <span className="font-display text-4xl font-black text-white tracking-tight">
              {bodyFat != null ? `${bodyFat}%` : "–"}
            </span>
            <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider mt-0.5">
              Grasa corporal
            </span>
          </div>
        </div>
      </div>

      {/* 6-Grid Cards */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="rounded-2xl border border-white/[0.08] bg-[#131926]/70 p-4 backdrop-blur-xl shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block">Masa muscular</span>
          <p className="font-display text-2xl font-black text-white mt-1">
            {leanMass != null ? `${leanMass} kg` : "–"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#131926]/70 p-4 backdrop-blur-xl shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block">Peso actual</span>
          <p className="font-display text-2xl font-black text-white mt-1">
            {weight != null ? `${weight} kg` : "–"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#131926]/70 p-4 backdrop-blur-xl shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block">IMC</span>
          <p className="font-display text-2xl font-black text-white mt-1">
            {bmi != null ? bmi.toFixed(1) : "–"}
          </p>
          <span className="text-[10px] font-bold mt-0.5 block" style={{ color: bmiColor }}>{bmiLabel}</span>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#131926]/70 p-4 backdrop-blur-xl shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block">Metabolismo basal</span>
          <p className="font-display text-2xl font-black text-white mt-1">
            {bmr != null ? `${Math.round(bmr).toLocaleString()} kcal` : "–"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#131926]/70 p-4 backdrop-blur-xl shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block">Calorías mantenimiento</span>
          <p className="font-display text-2xl font-black text-white mt-1">
            {maintenanceCalories != null ? `${maintenanceCalories.toLocaleString()} kcal` : "–"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#131926]/70 p-4 backdrop-blur-xl shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block">Peso ideal</span>
          <p className="font-display text-2xl font-black text-[#00d2ff] mt-1">{idealRange}</p>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`rounded-2xl border p-4 backdrop-blur-xl flex items-center gap-3 shadow-lg ${
        isHealthy
          ? "border-[#22c55e]/30 bg-gradient-to-r from-[#13281e]/80 to-[#101e17]/80"
          : "border-[#f59e0b]/30 bg-gradient-to-r from-[#281e13]/80 to-[#1e1710]/80"
      }`}>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0 ${isHealthy ? "bg-[#22c55e]/20 text-[#22c55e]" : "bg-[#f59e0b]/20 text-[#f59e0b]"}`}>
          {isHealthy ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
        </div>
        <div>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isHealthy ? "text-[#22c55e]" : "text-[#f59e0b]"}`}>Tu estado actual</span>
          <p className="font-display font-bold text-white text-sm mt-0.5">{bmiLabel} · IMC {bmi?.toFixed(1) ?? "–"}</p>
          <p className="text-xs text-[#94a3b8]">
            {isHealthy
              ? "Tu composición corporal está dentro del rango saludable."
              : "Consulta con tu entrenador para ajustar tu plan."
            }
          </p>
        </div>
      </div>
    </div>
  );
}
