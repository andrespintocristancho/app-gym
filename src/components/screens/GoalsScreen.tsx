"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ChevronLeft, Plus, Target, Dumbbell, Flame, 
  Scale, CheckCircle2, Edit3, Sparkles, X, Trash2, Zap
} from "lucide-react";
import { createGoal, updateGoal, deleteGoal } from "@/actions/goalActions";

type Goal = {
  id: string; 
  title: string; 
  targetValue: number; 
  currentValue: number; 
  progressPercentage?: number;
  unit: string; 
  deadline: Date | string | null; 
  achieved: boolean;
  sourceLabel?: string;
};

interface GoalsScreenProps {
  clientId?: string;
  initialGoals?: Goal[];
}

export function GoalsScreen({ clientId, initialGoals = [] }: GoalsScreenProps) {
  const [tab, setTab] = useState<"actuales" | "historial">("actuales");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({ 
    title: "", 
    targetValue: "", 
    unit: "kg", 
    deadline: "" 
  });
  const [loading, setLoading] = useState(false);

  const activeGoals = initialGoals.filter(g => !g.achieved);
  const historyGoals = initialGoals.filter(g => g.achieved);

  const presets = [
    { title: "Reducir perímetro de cintura", target: "82", unit: "cm" },
    { title: "Ganar masa muscular (Peso)", target: "82", unit: "kg" },
    { title: "Incrementar volumen de brazos", target: "40", unit: "cm" },
    { title: "Aumentar carga en Press Banca", target: "85", unit: "kg" },
    { title: "Reducir porcentaje de grasa", target: "14", unit: "%" },
    { title: "Completar entrenamientos del mes", target: "16", unit: "sesiones" },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !form.title || !form.targetValue) return;
    setLoading(true);
    if (editingId) {
      await updateGoal(editingId, {
        title: form.title, 
        targetValue: Number(form.targetValue),
        unit: form.unit,
        deadline: form.deadline || undefined
      });
    } else {
      await createGoal(clientId, {
        title: form.title, 
        targetValue: Number(form.targetValue),
        unit: form.unit,
        deadline: form.deadline || undefined
      });
    }
    setLoading(false);
    setShowModal(false);
    setEditingId(null);
  };

  const handleEdit = (g: Goal) => {
    setForm({
      title: g.title, 
      targetValue: String(g.targetValue),
      unit: g.unit,
      deadline: g.deadline ? new Date(g.deadline).toISOString().split('T')[0] : ""
    });
    setEditingId(g.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Seguro de eliminar este objetivo?")) {
      setLoading(true);
      await deleteGoal(id);
      setLoading(false);
    }
  };

  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("banca") || t.includes("fuerza")) return Target;
    if (t.includes("grasa")) return Flame;
    if (t.includes("masa") || t.includes("brazo")) return Dumbbell;
    return Scale;
  };

  const getColor = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("banca") || t.includes("fuerza")) return "#22c55e";
    if (t.includes("grasa")) return "#f43f5e";
    if (t.includes("masa") || t.includes("brazo")) return "#0066ff";
    return "#38bdf8";
  };

  return (
    <div className="space-y-6 pb-24 max-w-lg mx-auto animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="rounded-full p-2 bg-white/5 text-[#94a3b8] hover:text-white transition">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-bold text-white">Mis Objetivos</h1>
        <div className="w-9" />
      </div>

      {/* Info Card: Cálculo 100% Automático */}
      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-3.5 flex items-start gap-2.5">
        <Sparkles className="h-4 w-4 text-[#00d2ff] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[#cbd5e1] leading-relaxed">
          <strong>Cálculo Automático:</strong> El progreso de tus objetivos se alimenta directamente desde tus medidas corporales, nutrición y entrenamientos. Sin registros manuales de avance.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-[#131926]/80 p-1 border border-white/[0.08] backdrop-blur-xl">
        <button 
          onClick={() => setTab("actuales")} 
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${tab === "actuales" ? "bg-[#0066ff] text-white shadow-[0_0_15px_rgba(0,102,255,0.6)]" : "text-[#94a3b8] hover:text-white"}`}
        >
          En Curso ({activeGoals.length})
        </button>
        <button 
          onClick={() => setTab("historial")} 
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${tab === "historial" ? "bg-[#0066ff] text-white shadow-[0_0_15px_rgba(0,102,255,0.6)]" : "text-[#94a3b8] hover:text-white"}`}
        >
          Cumplidos ({historyGoals.length})
        </button>
      </div>

      {tab === "actuales" ? (
        <div className="space-y-4">
          {activeGoals.length === 0 ? (
            <div className="text-center py-12 rounded-3xl border border-white/[0.08] bg-[#131926]/60 p-6 space-y-3">
              <Target className="h-10 w-10 text-[#64748b] mx-auto opacity-50" />
              <p className="text-white font-bold text-sm">No tienes objetivos activos</p>
              <p className="text-xs text-[#94a3b8]">Crea tu primer objetivo o pide a tu entrenador que active tu plan inteligente.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeGoals.map(goal => {
                const Icon = getIcon(goal.title);
                const color = getColor(goal.title);
                const progress = goal.progressPercentage ?? (goal.targetValue > 0 ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)) : 0);

                return (
                  <div key={goal.id} className="rounded-2xl border border-white/[0.08] bg-[#131926]/70 p-4 backdrop-blur-xl shadow-md space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20`, color: color }}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{goal.title}</h4>
                          <span className="text-xs text-[#94a3b8]">
                            Actual: <strong className="text-white">{goal.currentValue}</strong> / Meta: <strong className="text-[#00d2ff]">{goal.targetValue} {goal.unit}</strong>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-xs font-black text-[#00d2ff]">{progress}%</span>
                        <button onClick={() => handleEdit(goal)} className="p-1.5 hover:bg-white/10 rounded-lg ml-1 text-[#94a3b8] hover:text-white transition">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(goal.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full rounded-full bg-[#080d16] overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-[#0066ff] to-[#00d2ff] transition-all duration-700" 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>

                    {/* Live Data Source Badge */}
                    <div className="flex items-center justify-between text-[10px] text-[#64748b] pt-1 border-t border-white/5">
                      <span className="flex items-center gap-1 text-[#00d2ff]">
                        <Zap className="h-3 w-3" />
                        {goal.sourceLabel || "Sincronizado con medidas corporales"}
                      </span>
                      {goal.deadline && (
                        <span>Límite: {new Date(goal.deadline).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button 
            onClick={() => { 
              setForm({ title: "", targetValue: "", unit: "kg", deadline: "" }); 
              setEditingId(null); 
              setShowModal(true); 
            }} 
            className="w-full rounded-2xl bg-gradient-to-r from-[#0066ff] to-[#0084ff] py-4 text-sm font-bold text-white shadow-[0_0_25px_rgba(0,102,255,0.7)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" /> Crear nuevo objetivo
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {historyGoals.length === 0 ? (
            <div className="text-center py-10 text-[#94a3b8] text-sm">
              Aún no has completado objetivos. Sigue constante para alcanzar tu primera meta.
            </div>
          ) : (
            historyGoals.map(g => (
              <div key={g.id} className="rounded-2xl border border-emerald-500/20 bg-[#13281e]/40 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#22c55e]" />
                  <div>
                    <h4 className="font-bold text-white text-sm">{g.title}</h4>
                    <span className="text-xs text-[#4edea3]">Meta alcanzada: {g.targetValue} {g.unit}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#22c55e] px-2.5 py-1 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/30">
                  ¡Logrado!
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal: Formulario sin campos manuales de progreso */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl border border-white/[0.1] bg-[#131926] p-6 shadow-2xl space-y-4">
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-[#94a3b8] hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="font-display text-xl font-bold text-white">
              {editingId ? "Editar Objetivo" : "Nuevo Objetivo Automático"}
            </h3>

            {/* Presets rápidos */}
            {!editingId && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-[#94a3b8]">Plantillas rápidas:</span>
                <div className="flex flex-wrap gap-1.5">
                  {presets.map(p => (
                    <button
                      key={p.title}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, title: p.title, targetValue: p.target, unit: p.unit }))}
                      className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-slate-300 hover:text-white hover:border-[#0066ff] transition"
                    >
                      {p.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase text-[#94a3b8] block mb-1">Título del Objetivo</label>
                <input 
                  required 
                  value={form.title} 
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
                  placeholder="Ej: Reducir cintura o Aumentar Press Banca"
                  className="w-full rounded-xl border border-white/10 bg-[#080d16] px-3 py-2.5 text-sm text-white focus:border-[#0066ff] focus:outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-[#94a3b8] block mb-1">Valor Meta</label>
                  <input 
                    required 
                    type="number" 
                    step="0.1"
                    value={form.targetValue} 
                    onChange={e => setForm(f => ({ ...f, targetValue: e.target.value }))} 
                    placeholder="Ej: 80"
                    className="w-full rounded-xl border border-white/10 bg-[#080d16] px-3 py-2 text-sm text-white focus:border-[#0066ff] focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-[#94a3b8] block mb-1">Unidad</label>
                  <select 
                    value={form.unit} 
                    onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} 
                    className="w-full rounded-xl border border-white/10 bg-[#080d16] px-3 py-2 text-sm text-white focus:border-[#0066ff] focus:outline-none"
                  >
                    <option value="kg">kg (peso / fuerza)</option>
                    <option value="cm">cm (cintura / brazo)</option>
                    <option value="%">% (grasa corporal)</option>
                    <option value="sesiones">sesiones (asistencia)</option>
                    <option value="kcal">kcal (nutrición)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-[#94a3b8] block mb-1">Fecha Límite (Opcional)</label>
                <input 
                  type="date" 
                  value={form.deadline} 
                  onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} 
                  className="w-full rounded-xl border border-white/10 bg-[#080d16] px-3 py-2 text-sm text-white focus:border-[#0066ff] focus:outline-none" 
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-[#00d2ff]">
                El sistema detectará el valor actual automáticamente a partir de tu historial y lo actualizará con cada nuevo registro.
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full rounded-2xl bg-[#0066ff] py-3.5 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50 transition"
              >
                {loading ? "Guardando..." : "Guardar y Vincular Objetivo"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
