"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { createMeasurement } from "@/actions/measurementActions";
import { assignSmartPlan } from "@/actions/clientActions";
import { createGoal, deleteGoal } from "@/actions/goalActions";
import { updateNutritionTargets } from "@/actions/nutritionActions";
import { copyRoutineToClient, deleteRoutine } from "@/actions/routineActions";
import { 
  ChevronDown, ChevronUp, Save, Sparkles, CheckCircle2, Zap, 
  Target, Utensils, Dumbbell, Trash2, Plus, AlertCircle, TrendingUp
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const measurementFields = [
  { section: "Datos Principales", fields: [
    { key: "weight", label: "Peso (kg)", unit: "kg" },
    { key: "height", label: "Altura (cm)", unit: "cm" },
  ]},
  { section: "Tren Superior", fields: [
    { key: "neck", label: "Cuello", unit: "cm" },
    { key: "shoulders", label: "Hombros", unit: "cm" },
    { key: "chest", label: "Pecho", unit: "cm" },
    { key: "rightArm", label: "Brazo Derecho", unit: "cm" },
    { key: "leftArm", label: "Brazo Izquierdo", unit: "cm" },
    { key: "rightForearm", label: "Antebrazo Derecho", unit: "cm" },
    { key: "leftForearm", label: "Antebrazo Izquierdo", unit: "cm" },
  ]},
  { section: "Tren Medio", fields: [
    { key: "waist", label: "Cintura", unit: "cm" },
    { key: "abdomen", label: "Abdomen", unit: "cm" },
    { key: "hip", label: "Cadera", unit: "cm" },
  ]},
  { section: "Tren Inferior", fields: [
    { key: "rightThigh", label: "Muslo Derecho", unit: "cm" },
    { key: "leftThigh", label: "Muslo Izquierdo", unit: "cm" },
    { key: "rightCalf", label: "Pantorrilla Derecha", unit: "cm" },
    { key: "leftCalf", label: "Pantorrilla Izquierda", unit: "cm" },
  ]},
];

const allFields = measurementFields.flatMap(s => s.fields);

interface ClientProfileTabsProps {
  client: any;
  measurements: any[];
  routines?: any[];
  availableRoutines?: Array<{ id: string; name: string }>;
  goals?: any[];
  nutritionTarget?: any;
  ecosystemData?: any;
}

export function ClientProfileTabs({ 
  client, 
  measurements, 
  routines = [], 
  availableRoutines = [],
  goals = [],
  nutritionTarget,
  ecosystemData
}: ClientProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("measurements");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Estados para Objetivos
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalUnit, setGoalUnit] = useState("kg");
  const [goalDeadline, setGoalDeadline] = useState("");

  // Estados para Nutrición
  const [targetCalories, setTargetCalories] = useState(nutritionTarget?.targetCalories ? String(nutritionTarget.targetCalories) : "2200");
  const [targetProtein, setTargetProtein] = useState(nutritionTarget?.targetProtein ? String(nutritionTarget.targetProtein) : "150");
  const [targetCarbs, setTargetCarbs] = useState(nutritionTarget?.targetCarbs ? String(nutritionTarget.targetCarbs) : "250");
  const [targetFats, setTargetFats] = useState(nutritionTarget?.targetFats ? String(nutritionTarget.targetFats) : "60");

  // Estado para asignar rutina
  const [selectedRoutineToAssign, setSelectedRoutineToAssign] = useState("");

  const latest = measurements.length > 0 ? measurements[0] : null;
  const previous = measurements.length > 1 ? measurements[1] : null;

  const handleMeasurementSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: Record<string, string | number> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });
    await createMeasurement(client.id, data);
    setLoading(false);
    setShowForm(false);
    form.reset();
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim() || !goalTarget) return;
    setLoading(true);
    await createGoal(client.id, {
      title: goalTitle.trim(),
      targetValue: Number(goalTarget),
      unit: goalUnit,
      deadline: goalDeadline || undefined
    });
    setGoalTitle("");
    setGoalTarget("");
    setLoading(false);
  };

  const handleSaveNutrition = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await updateNutritionTargets(client.id, {
      targetCalories: Number(targetCalories),
      targetProtein: Number(targetProtein),
      targetCarbs: Number(targetCarbs),
      targetFats: Number(targetFats)
    });
    setLoading(false);
    alert("¡Plan nutricional actualizado y sincronizado en la cuenta del cliente!");
  };

  const handleAssignRoutine = async () => {
    if (!selectedRoutineToAssign) return;
    setLoading(true);
    await copyRoutineToClient(selectedRoutineToAssign, client.id);
    setSelectedRoutineToAssign("");
    setLoading(false);
  };

  const calculateDiff = (current: number | null, prev: number | null) => {
    if (current == null || prev == null) return null;
    const diff = current - prev;
    return diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
  };

  const tabs = [
    { id: "measurements", label: "📏 1. Medidas" },
    { id: "goals", label: "🎯 2. Objetivos" },
    { id: "nutrition", label: "🥗 3. Dieta / Nutrición" },
    { id: "routines", label: "🏋️ 4. Rutinas" },
    { id: "plan", label: "⚡ 5. Plan Inteligente" },
    { id: "ai", label: "🤖 6. Análisis IA" },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-4 px-3 text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "text-blue-500 border-b-2 border-blue-500 bg-blue-500/5"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* ======================= 1. MEDIDAS CORPORALES ======================= */}
        {activeTab === "measurements" && (
          <div className="space-y-8">
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center justify-between w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium text-sm transition-colors"
            >
              <span>{showForm ? "Ocultar Formulario" : "➕ Registrar Nuevas Medidas del Atleta"}</span>
              {showForm ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {showForm && (
              <form onSubmit={handleMeasurementSubmit} className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/50 space-y-6">
                {measurementFields.map((section) => (
                  <div key={section.section}>
                    <h4 className="text-blue-400 font-medium text-xs uppercase tracking-wider mb-3 border-b border-slate-700 pb-2">
                      {section.section}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {section.fields.map((field) => (
                        <div key={field.key}>
                          <label className="block text-xs text-slate-400 mb-1">{field.label}</label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.1"
                              name={field.key}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 pr-10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="0"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                              {field.unit}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Sincronizando..." : "Guardar y Actualizar Ecosistema"}
                  </button>
                </div>
              </form>
            )}

            {/* Resumen de Composición del último registro */}
            {latest && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Peso</span>
                  <p className="text-xl font-bold text-white mt-1">{latest.weight ?? "–"} kg</p>
                </div>
                <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">% Grasa</span>
                  <p className="text-xl font-bold text-rose-400 mt-1">{latest.bodyFat ? `${latest.bodyFat}%` : "–"}</p>
                </div>
                <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Masa Magra</span>
                  <p className="text-xl font-bold text-emerald-400 mt-1">{latest.leanMass ? `${latest.leanMass} kg` : "–"}</p>
                </div>
                <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">IMC</span>
                  <p className="text-xl font-bold text-blue-400 mt-1">{latest.bmi ?? "–"}</p>
                </div>
              </div>
            )}

            {/* Gráfica de Progreso */}
            {measurements.length > 0 && (
              <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700/50 mb-6">
                <h3 className="text-white font-semibold mb-4">📈 Evolución del Peso Corporal</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[...measurements].reverse()} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => format(new Date(date), "dd MMM", { locale: es })}
                        stroke="#94a3b8" 
                        fontSize={12}
                      />
                      <YAxis 
                        domain={['dataMin - 2', 'dataMax + 2']} 
                        stroke="#94a3b8" 
                        fontSize={12}
                        tickFormatter={(val) => `${val}kg`}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                        labelFormatter={(date) => format(new Date(date as string), "dd MMM yyyy", { locale: es })}
                        formatter={(value) => [`${value} kg`, 'Peso']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', r: 4 }}
                        activeDot={{ r: 6, fill: '#60a5fa' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Tabla Comparativa */}
            {measurements.length > 0 ? (
              <div>
                <h3 className="text-white font-semibold mb-4">
                  📊 Progreso y Comparativa
                  <span className="text-sm text-slate-500 font-normal ml-2">
                    ({measurements.length} registro{measurements.length > 1 ? "s" : ""})
                  </span>
                </h3>
                <div className="overflow-x-auto rounded-lg border border-slate-800">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-800/80 text-slate-300">
                      <tr>
                        <th className="p-3 font-medium">Medida</th>
                        <th className="p-3 font-medium">
                          Última
                          <span className="block text-xs text-slate-500 font-normal">
                            {format(new Date(latest.date), "dd MMM yyyy", { locale: es })}
                          </span>
                        </th>
                        {previous && (
                          <th className="p-3 font-medium">
                            Anterior
                            <span className="block text-xs text-slate-500 font-normal">
                              {format(new Date(previous.date), "dd MMM yyyy", { locale: es })}
                            </span>
                          </th>
                        )}
                        {previous && <th className="p-3 font-medium">Cambio</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {allFields.map((field) => {
                        const currentVal = latest[field.key];
                        const prevVal = previous ? previous[field.key] : null;
                        const diff = calculateDiff(currentVal, prevVal);

                        if (currentVal == null && prevVal == null) return null;

                        return (
                          <tr key={field.key} className="hover:bg-slate-800/30">
                            <td className="p-3 font-medium text-slate-400">
                              {field.label}
                              <span className="text-slate-600 ml-1">({field.unit})</span>
                            </td>
                            <td className="p-3 text-white font-medium">{currentVal ?? "-"}</td>
                            {previous && <td className="p-3">{prevVal ?? "-"}</td>}
                            {previous && (
                              <td className="p-3">
                                {diff ? (
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                                      Number(diff) > 0
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : Number(diff) < 0
                                        ? "bg-blue-500/10 text-blue-400"
                                        : "bg-slate-500/10 text-slate-400"
                                    }`}
                                  >
                                    {Number(diff) > 0 ? "▲" : Number(diff) < 0 ? "▼" : "="} {diff}
                                  </span>
                                ) : (
                                  "-"
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                <p className="text-lg mb-2">📏</p>
                No hay medidas registradas para este cliente. ¡Haz clic en el botón de arriba para registrar las medidas iniciales!
              </div>
            )}
          </div>
        )}

        {/* ======================= 2. OBJETIVOS ======================= */}
        {activeTab === "goals" && (
          <div className="space-y-6">
            <div className="border border-blue-500/20 bg-blue-500/5 p-4 rounded-xl">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                Gestión de Objetivos del Cliente
              </h3>
              <p className="text-slate-300 text-xs mt-1">
                El instructor define la meta. El sistema calcula el valor actual y el porcentaje de progreso automáticamente a partir de las medidas, nutrición y entrenamientos.
              </p>
            </div>

            {/* Formulario para Crear Objetivo */}
            <form onSubmit={handleCreateGoal} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Asignar Nuevo Objetivo</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Título del Objetivo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Reducir cintura a 82cm o Press Banca 90kg"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Valor Meta</label>
                    <input
                      type="number"
                      step="0.5"
                      required
                      placeholder="Ej: 82"
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Unidad</label>
                    <select
                      value={goalUnit}
                      onChange={(e) => setGoalUnit(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="kg">kg (peso/fuerza)</option>
                      <option value="cm">cm (perímetro)</option>
                      <option value="%">% (grasa)</option>
                      <option value="sesiones">sesiones</option>
                      <option value="kcal">kcal</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Fecha Límite (Opcional)</label>
                  <input
                    type="date"
                    value={goalDeadline}
                    onChange={(e) => setGoalDeadline(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> Asignar Objetivo al Cliente
                </button>
              </div>
            </form>

            {/* Lista de Objetivos Activos */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Objetivos en Curso ({goals.length})</h4>
              {goals.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No hay objetivos configurados para este atleta.</p>
              ) : (
                goals.map(g => (
                  <div key={g.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-white text-sm">{g.title}</h5>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Meta: <strong className="text-blue-400">{g.targetValue} {g.unit}</strong> · Actual: <strong className="text-emerald-400">{g.currentValue} {g.unit}</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${g.achieved ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"}`}>
                        {g.achieved ? "¡Cumplido!" : "En progreso"}
                      </span>
                      <button
                        onClick={async () => {
                          if (confirm("¿Eliminar este objetivo?")) {
                            setLoading(true);
                            await deleteGoal(g.id);
                            setLoading(false);
                          }
                        }}
                        className="p-1.5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ======================= 3. DIETA / PLAN NUTRICIONAL ======================= */}
        {activeTab === "nutrition" && (
          <div className="space-y-6">
            <div className="border border-amber-500/20 bg-amber-500/5 p-4 rounded-xl">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Utensils className="w-4 h-4 text-amber-400" />
                Plan Nutricional del Instructor
              </h3>
              <p className="text-slate-300 text-xs mt-1">
                Configura los requerimientos calóricos y macronutrientes diarios. El cliente verá estos objetivos en su pantalla de Nutrición y el sistema supervisará su cumplimiento con alertas automáticas.
              </p>
            </div>

            <form onSubmit={handleSaveNutrition} className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">Meta Calórica Diaria (kcal)</label>
                  <input
                    type="number"
                    step="50"
                    required
                    value={targetCalories}
                    onChange={(e) => setTargetCalories(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Calorías recomendadas para el objetivo</span>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">Proteínas (g/día)</label>
                  <input
                    type="number"
                    step="5"
                    required
                    value={targetProtein}
                    onChange={(e) => setTargetProtein(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Esencial para preservar y construir músculo</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">Carbohidratos (g/día)</label>
                  <input
                    type="number"
                    step="5"
                    required
                    value={targetCarbs}
                    onChange={(e) => setTargetCarbs(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">Grasas Saludables (g/día)</label>
                  <input
                    type="number"
                    step="5"
                    required
                    value={targetFats}
                    onChange={(e) => setTargetFats(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? "Guardando..." : "Guardar Dieta y Sincronizar en Cuenta del Atleta"}
              </button>
            </form>
          </div>
        )}

        {/* ======================= 4. RUTINAS ======================= */}
        {activeTab === "routines" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-white font-semibold">Rutinas Asignadas</h3>
                <p className="text-slate-400 text-xs mt-0.5">El atleta visualiza y registra series directamente desde estas rutinas.</p>
              </div>
              <a
                href={`/dashboard/routines/new?clientId=${client.id}`}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Diseñar Nueva Rutina
              </a>
            </div>

            {/* Asignar rutina preexistente */}
            {availableRoutines.length > 0 && (
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                <span className="text-xs text-slate-300 font-bold whitespace-nowrap">Asignar rutina existente:</span>
                <select
                  value={selectedRoutineToAssign}
                  onChange={(e) => setSelectedRoutineToAssign(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                >
                  <option value="">Selecciona una rutina para copiar a este atleta...</option>
                  {availableRoutines.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                <button
                  onClick={handleAssignRoutine}
                  disabled={!selectedRoutineToAssign || loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition disabled:opacity-50 whitespace-nowrap"
                >
                  Copiar y Asignar
                </button>
              </div>
            )}

            {/* Lista de rutinas del cliente */}
            <div className="space-y-3">
              {routines.length === 0 ? (
                <div className="text-center py-8 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">El cliente aún no tiene rutinas asignadas.</p>
                </div>
              ) : (
                routines.map(r => (
                  <div key={r.id} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{r.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{r.exercises?.length || 0} ejercicios programados</p>
                    </div>
                    <button
                      onClick={async () => {
                        if (confirm(`¿Eliminar la rutina ${r.name}?`)) {
                          setLoading(true);
                          await deleteRoutine(r.id);
                          setLoading(false);
                        }
                      }}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ======================= 5. PLAN INTELIGENTE AUTOMATIZADO ======================= */}
        {activeTab === "plan" && (
          <div className="space-y-6">
            <div className="border border-blue-500/20 bg-blue-500/5 p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">Automatización Total del Entrenador</h3>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Asigna el objetivo principal y la duración. El sistema creará automáticamente las metas individuales, los indicadores clave, calculará las calorías y macronutrientes objetivo y generará el seguimiento quincenal sin cálculos manuales.
              </p>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                const formData = new FormData(e.currentTarget);
                const planType = formData.get("planType") as any;
                const weeks = Number(formData.get("weeks"));
                await assignSmartPlan(client.id, planType, weeks);
                setLoading(false);
                alert("¡Plan inteligente activado con éxito! Se han generado las metas, nutrición y seguimiento.");
              }}
              className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 space-y-5"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Objetivo Principal del Cliente
                </label>
                <select
                  name="planType"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MUSCLE_GAIN">Ganar masa muscular (Hipertrofia)</option>
                  <option value="FAT_LOSS">Perder grasa corporal (Definición)</option>
                  <option value="RECOMPOSITION">Recomposición corporal (Ganar músculo y perder grasa)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Duración del Ciclo
                </label>
                <select
                  name="weeks"
                  defaultValue="16"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="4">4 semanas (1 mes de choque)</option>
                  <option value="8">8 semanas (2 meses)</option>
                  <option value="12">12 semanas (3 meses)</option>
                  <option value="16">16 semanas (4 meses - Recomendado)</option>
                  <option value="24">24 semanas (Semestre completo)</option>
                </select>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-400">
                <span className="font-bold text-white block">Acciones automáticas que se ejecutarán:</span>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Calcula y crea metas de peso, cintura y brazo.</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Calcula las calorías y macronutrientes idóneos.</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Inicia el reporte evolutivo con seguimiento quincenal.</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sincroniza el panel del cliente en tiempo real.</div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
              >
                <Zap className="w-5 h-5 fill-white" />
                {loading ? "Generando Plan Inteligente..." : "⚡ Activar Plan Automatizado"}
              </button>
            </form>
          </div>
        )}

        {/* ======================= 6. ANÁLISIS IA ======================= */}
        {activeTab === "ai" && (
          <div className="space-y-6">
            {ecosystemData ? (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-gradient-to-b from-blue-950/40 to-slate-900 border border-blue-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Diagnóstico Central Generado</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                      {ecosystemData.aiAnalysis.statusTitle}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">
                    {ecosystemData.aiAnalysis.conclusion}
                  </p>
                </div>

                {ecosystemData.aiAnalysis.alerts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase text-slate-400">Alertas Detectadas</h4>
                    {ecosystemData.aiAnalysis.alerts.map((al: string, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-200">
                        <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>{al}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2">
                    <span className="text-xs font-bold uppercase text-slate-400">Predicción 30 Días</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {ecosystemData.aiAnalysis.predictions.projectionText}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2">
                    <span className="text-xs font-bold uppercase text-slate-400">Recomendaciones Activas</span>
                    <ul className="text-xs text-slate-300 space-y-1">
                      {ecosystemData.aiAnalysis.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-blue-400">•</span> {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-8 text-center">Registra al menos una medida corporal para generar el análisis.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
