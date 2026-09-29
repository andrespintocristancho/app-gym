"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ChevronLeft, Plus, Utensils, Flame, 
  Apple, Droplets, X 
} from "lucide-react";
import { addMeal } from "@/actions/nutritionActions";

interface Meal {
  time: string;
  name: string;
  cals: number;
  p: number;
  c: number;
  f: number;
}

interface NutritionScreenProps {
  clientId?: string;
  nutrition?: {
    calories: number;
    targetCalories: number;
    protein: number;
    targetProtein: number;
    carbs: number;
    targetCarbs: number;
    fats: number;
    targetFats: number;
    mealsJson?: string | null;
  };
  compliance?: {
    todayCalories: number;
    targetCalories: number;
    calorieDifference: number;
    complianceStatus: string;
    complianceMessage: string;
    hasAlert: boolean;
  };
}

export function NutritionScreen({
  clientId = "",
  nutrition,
  compliance
}: NutritionScreenProps) {
  const [tab, setTab] = useState<"resumen" | "alimentos">("resumen");
  const [showModal, setShowModal] = useState(false);
  const [mealName, setMealName] = useState("");
  const [mealCalories, setMealCalories] = useState("0");
  const [mealProtein, setMealProtein] = useState("0");
  const [mealCarbs, setMealCarbs] = useState("0");
  const [mealFats, setMealFats] = useState("0");
  const [loading, setLoading] = useState(false);

  // If no log exists yet, display everything at zero
  const data = nutrition ?? {
    calories: 0, targetCalories: 0,
    protein: 0, targetProtein: 0,
    carbs: 0, targetCarbs: 0,
    fats: 0, targetFats: 0,
    mealsJson: null
  };

  // Parse meals from JSON field
  const meals: Meal[] = (() => {
    try {
      return data.mealsJson ? JSON.parse(data.mealsJson) : [];
    } catch {
      return [];
    }
  })();

  const calPct = data.targetCalories > 0
    ? Math.min(100, Math.round((data.calories / data.targetCalories) * 100))
    : 0;

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return;
    setLoading(true);
    await addMeal(clientId, {
      name: mealName || "Comida",
      calories: Number(mealCalories),
      protein: Number(mealProtein),
      carbs: Number(mealCarbs),
      fats: Number(mealFats)
    });
    setLoading(false);
    setShowModal(false);
    setMealName(""); setMealCalories("0"); setMealProtein("0"); setMealCarbs("0"); setMealFats("0");
  };

  return (
    <div className="space-y-6 pb-24 max-w-lg mx-auto animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="rounded-full p-2 bg-white/5 text-[#94a3b8] hover:text-white transition">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-bold text-white">Nutrición</h1>
        <div className="w-9" />
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-[#131926]/80 p-1 border border-white/[0.08] backdrop-blur-xl">
        <button
          onClick={() => setTab("resumen")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${tab === "resumen" ? "bg-[#0066ff] text-white shadow-[0_0_15px_rgba(0,102,255,0.6)]" : "text-[#94a3b8] hover:text-white"}`}
        >
          Resumen
        </button>
        <button
          onClick={() => setTab("alimentos")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${tab === "alimentos" ? "bg-[#0066ff] text-white shadow-[0_0_15px_rgba(0,102,255,0.6)]" : "text-[#94a3b8] hover:text-white"}`}
        >
          Alimentos ({meals.length})
        </button>
      </div>

      {tab === "resumen" ? (
        <div className="space-y-5">
          {/* Banner de Cumplimiento / Alerta de Calorías */}
          {compliance && compliance.complianceStatus !== "NO_TARGET" && (
            <div className={`rounded-2xl p-4 border backdrop-blur-xl flex items-start gap-3 shadow-lg ${
              compliance.hasAlert 
                ? "bg-amber-500/10 border-amber-500/30 text-amber-200" 
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
            }`}>
              <div className={`p-2 rounded-xl flex-shrink-0 ${compliance.hasAlert ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                <Flame className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${compliance.hasAlert ? "text-amber-400" : "text-emerald-400"}`}>
                  {compliance.hasAlert ? "Alerta de Nutrición" : "Avance del Día"}
                </span>
                <p className="text-xs font-semibold leading-relaxed">
                  {compliance.complianceMessage}
                </p>
              </div>
            </div>
          )}

          {/* Calories Ring Card */}
          <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#131926]/90 to-[#0d131f]/90 p-6 backdrop-blur-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <Flame className="h-5 w-5 text-[#f59e0b]" /> Calorías
                </h2>
                {data.targetCalories === 0 ? (
                  <p className="text-xs text-[#94a3b8] mt-0.5">Tu entrenador aún no ha asignado una meta calórica</p>
                ) : (
                  <p className="text-xs text-[#94a3b8] mt-0.5">Meta: {data.targetCalories} kcal</p>
                )}
              </div>
              <div className="text-right">
                <span className="font-display text-3xl font-black text-white">{data.calories}</span>
                <span className="text-sm text-[#94a3b8] ml-1">kcal</span>
              </div>
            </div>
            <div className="h-3 w-full rounded-full bg-[#080d16] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#f59e0b] to-[#ef4444] transition-all duration-700"
                style={{ width: `${calPct}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-[#94a3b8]">0</span>
              <span className="text-[10px] font-bold text-[#f59e0b]">{calPct}%</span>
              <span className="text-[10px] text-[#94a3b8]">{data.targetCalories}</span>
            </div>
          </div>

          {/* Tarjeta de Impacto en Ecosistema */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#0d1522]/80 p-3.5 flex items-center gap-2.5 text-xs text-[#94a3b8]">
            <span className="text-lg">🔄</span>
            <p className="text-[11px] leading-tight">
              <strong>Conexión con Medidas:</strong> Tu balance calórico impacta directamente tu grasa corporal y la velocidad de reducción de cintura.
            </p>
          </div>

          {/* Macros */}
          <div className="space-y-3">
            {/* Proteínas */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#131926]/70 p-4 backdrop-blur-xl shadow-md space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#0066ff]" /> Proteínas
                </span>
                <span className="font-display font-bold text-[#00d2ff]">
                  {data.protein}g / {data.targetProtein > 0 ? `${data.targetProtein}g` : "sin meta"}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#080d16] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#0066ff] transition-all duration-700"
                  style={{ width: `${data.targetProtein > 0 ? Math.min(100, (data.protein / data.targetProtein) * 100) : 0}%` }}
                />
              </div>
            </div>

            {/* Carbohidratos */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#131926]/70 p-4 backdrop-blur-xl shadow-md space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#f43f5e]" /> Carbohidratos
                </span>
                <span className="font-display font-bold text-[#fb7185]">
                  {data.carbs}g / {data.targetCarbs > 0 ? `${data.targetCarbs}g` : "sin meta"}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#080d16] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#f43f5e] transition-all duration-700"
                  style={{ width: `${data.targetCarbs > 0 ? Math.min(100, (data.carbs / data.targetCarbs) * 100) : 0}%` }}
                />
              </div>
            </div>

            {/* Grasas */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#131926]/70 p-4 backdrop-blur-xl shadow-md space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#22c55e]" /> Grasas
                </span>
                <span className="font-display font-bold text-[#4edea3]">
                  {data.fats}g / {data.targetFats > 0 ? `${data.targetFats}g` : "sin meta"}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#080d16] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#22c55e] transition-all duration-700"
                  style={{ width: `${data.targetFats > 0 ? Math.min(100, (data.fats / data.targetFats) * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="w-full rounded-2xl bg-gradient-to-r from-[#0066ff] to-[#0084ff] py-4 text-sm font-bold text-white shadow-[0_0_25px_rgba(0,102,255,0.7)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" /> Registrar comida
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {meals.length === 0 ? (
            <div className="text-center py-10">
              <Apple className="h-8 w-8 text-[#94a3b8] mx-auto mb-3 opacity-50" />
              <p className="text-[#94a3b8] text-sm">No existen registros todavía.</p>
              <p className="text-[#64748b] text-xs mt-1">Registra tu primera comida del día.</p>
            </div>
          ) : (
            meals.map((m, i) => (
              <div key={i} className="rounded-2xl border border-white/[0.08] bg-[#131926]/70 p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#00d2ff]">{m.time}</span>
                  <h4 className="font-bold text-white text-xs mt-0.5">{m.name}</h4>
                  <p className="text-[11px] text-[#94a3b8] mt-1">P: {m.p}g · C: {m.c}g · G: {m.f}g</p>
                </div>
                <span className="font-display font-bold text-white text-sm">{m.cals} kcal</span>
              </div>
            ))
          )}
          <button
            onClick={() => setShowModal(true)}
            className="w-full rounded-2xl border border-white/10 bg-[#080d16] py-3 text-xs font-bold text-[#94a3b8] hover:text-white hover:border-white/20 transition flex items-center justify-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Agregar comida
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl border border-white/[0.1] bg-[#131926] p-6 shadow-2xl">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-[#94a3b8] hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-display text-xl font-bold text-white mb-4">Registrar Comida</h3>

            <form onSubmit={handleAddMeal} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase text-[#94a3b8] block mb-1">Nombre del alimento</label>
                <input
                  type="text"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  placeholder="Ej: Avena con proteína"
                  className="w-full rounded-xl border border-white/10 bg-[#080d16] px-3 py-2.5 text-sm text-white focus:border-[#0066ff] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-[#94a3b8] block mb-1">Calorías</label>
                  <input type="number" value={mealCalories} onChange={(e) => setMealCalories(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#080d16] px-3 py-2 text-sm text-white focus:border-[#0066ff] focus:outline-none" required />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-[#94a3b8] block mb-1">Proteínas (g)</label>
                  <input type="number" value={mealProtein} onChange={(e) => setMealProtein(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#080d16] px-3 py-2 text-sm text-white focus:border-[#0066ff] focus:outline-none" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-[#94a3b8] block mb-1">Carbos (g)</label>
                  <input type="number" value={mealCarbs} onChange={(e) => setMealCarbs(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#080d16] px-3 py-2 text-sm text-white focus:border-[#0066ff] focus:outline-none" required />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-[#94a3b8] block mb-1">Grasas (g)</label>
                  <input type="number" value={mealFats} onChange={(e) => setMealFats(e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#080d16] px-3 py-2 text-sm text-white focus:border-[#0066ff] focus:outline-none" required />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full rounded-2xl bg-[#0066ff] py-3.5 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50 transition">
                {loading ? "Guardando..." : "Guardar Comida"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
