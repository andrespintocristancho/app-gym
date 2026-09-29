"use client";

import { useState } from "react";
import { 
  ChevronLeft, Plus, Calendar, RotateCw, Sparkles, 
  CheckCircle2, X, ChevronRight, Layers, Save 
} from "lucide-react";
import Link from "next/link";
import { createMeasurement } from "@/actions/measurementActions";

interface MeasurementsScreenProps {
  clientId: string;
  measurements: any[];
}

export function MeasurementsScreen({ clientId, measurements }: MeasurementsScreenProps) {
  const [activeTab, setActiveTab] = useState<"cuerpo" | "historial">("cuerpo");
  const [viewAngle, setViewAngle] = useState<"frontal" | "espalda">("frontal");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const latest = measurements.length > 0 ? measurements[0] : null;

  // Measurement pins on anatomical body model — only show real values from DB
  const frontalPins = [
    { label: "Cuello", val: latest?.neck ?? null, unit: "cm", top: "16%", left: "20%", align: "left" },
    { label: "Pecho", val: latest?.chest ?? null, unit: "cm", top: "25%", left: "80%", align: "right" },
    { label: "Bíceps", val: latest?.rightArm ?? null, unit: "cm", top: "33%", left: "15%", align: "left" },
    { label: "Cintura", val: latest?.waist ?? null, unit: "cm", top: "45%", left: "82%", align: "right" },
    { label: "Cadera", val: latest?.hip ?? null, unit: "cm", top: "54%", left: "18%", align: "left" },
    { label: "Muslo", val: latest?.rightThigh ?? null, unit: "cm", top: "68%", left: "18%", align: "left" },
    { label: "Pantorrilla", val: latest?.rightCalf ?? null, unit: "cm", top: "82%", left: "82%", align: "right" },
  ];

  const espaldaPins = [
    { label: "Trapecios", val: latest?.neck ?? null, unit: "cm", top: "18%", left: "20%", align: "left" },
    { label: "Hombros", val: latest?.shoulders ?? null, unit: "cm", top: "24%", left: "80%", align: "right" },
    { label: "Tríceps", val: latest?.leftArm ?? null, unit: "cm", top: "33%", left: "15%", align: "left" },
    { label: "Dorsales", val: latest?.chest ?? null, unit: "cm", top: "38%", left: "82%", align: "right" },
    { label: "Glúteo", val: latest?.hip ?? null, unit: "cm", top: "54%", left: "18%", align: "left" },
    { label: "Femoral", val: latest?.leftThigh ?? null, unit: "cm", top: "68%", left: "82%", align: "right" },
    { label: "Gemelos", val: latest?.leftCalf ?? null, unit: "cm", top: "82%", left: "20%", align: "left" },
  ];

  const activePins = viewAngle === "frontal" ? frontalPins : espaldaPins;

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data: Record<string, string | number> = {};
    formData.forEach((val, key) => {
      data[key] = val.toString();
    });
    await createMeasurement(clientId, data);
    setLoading(false);
    setShowModal(false);
  };

  return (
    <div className="space-y-6 pb-24 max-w-lg mx-auto animate-fadeIn">
      {/* Top Header with Back */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="rounded-full p-2 bg-white/5 text-[#94a3b8] hover:text-white transition">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-bold text-white">Mis Medidas</h1>
        <div className="w-9" />
      </div>

      {/* Main Tabs: [Cuerpo] [Historial] */}
      <div className="flex rounded-2xl bg-[#131926]/80 p-1 border border-white/[0.08] backdrop-blur-xl">
        <button
          onClick={() => setActiveTab("cuerpo")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === "cuerpo"
              ? "bg-[#0066ff] text-white shadow-[0_0_15px_rgba(0,102,255,0.6)]"
              : "text-[#94a3b8] hover:text-white"
          }`}
        >
          Cuerpo
        </button>
        <button
          onClick={() => setActiveTab("historial")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === "historial"
              ? "bg-[#0066ff] text-white shadow-[0_0_15px_rgba(0,102,255,0.6)]"
              : "text-[#94a3b8] hover:text-white"
          }`}
        >
          Historial
        </button>
      </div>

      {activeTab === "cuerpo" ? (
        <div className="space-y-6">
          {/* Anatomical 3D Body Container */}
          <div className="relative min-h-[460px] rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#131926]/90 via-[#0c121e]/90 to-[#070a10] p-4 backdrop-blur-2xl shadow-2xl flex flex-col items-center justify-center overflow-hidden">
            {/* Ambient Cyan Glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-64 w-48 rounded-full bg-[#0066ff]/15 blur-3xl" />
            </div>

            {/* 3D Anatomical Silhouette Model */}
            <div className="relative z-10 w-full max-w-[280px] h-[400px] flex items-center justify-center">
              <svg
                viewBox="0 0 200 400"
                className="h-full w-full object-contain filter drop-shadow-[0_0_15px_rgba(0,210,255,0.3)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Anatomical body vector with futuristic neon contour */}
                <path
                  d="M100 20 C108 20 115 27 115 36 C115 45 108 52 100 52 C92 52 85 45 85 36 C85 27 92 20 100 20 Z"
                  fill="#0066ff"
                  fillOpacity="0.2"
                  stroke="#00d2ff"
                  strokeWidth="2"
                />
                <path
                  d="M90 53 L80 62 L60 85 L45 140 L40 190 L52 195 L60 145 L72 105 L72 170 L65 240 L60 330 L55 380 L75 380 L85 320 L95 240 L100 210 L105 240 L115 320 L125 380 L145 380 L140 330 L135 240 L128 170 L128 105 L140 145 L148 195 L160 190 L155 140 L140 85 L120 62 L110 53 Z"
                  fill="#0c1626"
                  stroke="#00d2ff"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                {/* Chest & Ab lines */}
                <path d="M80 95 Q100 105 120 95" stroke="#0066ff" strokeWidth="1.5" strokeDasharray="2 2" />
                <path d="M85 125 Q100 132 115 125" stroke="#0066ff" strokeWidth="1.5" />
                <path d="M88 150 Q100 155 112 150" stroke="#0066ff" strokeWidth="1.5" />
              </svg>

              {/* Dynamic Floating Pins */}
              {activePins.map((pin, i) => (
                <div
                  key={pin.label}
                  className="absolute z-20 flex flex-col items-center animate-fadeIn"
                  style={{ top: pin.top, left: pin.left }}
                >
                  <div className="flex items-center gap-1 rounded-xl bg-[#080d16]/90 border border-[#00d2ff]/40 px-2.5 py-1 backdrop-blur-md shadow-[0_0_12px_rgba(0,210,255,0.3)]">
                    <span className="text-[10px] font-bold text-[#94a3b8]">{pin.label}</span>
                    <span className="text-xs font-black text-white">{pin.val}</span>
                    <span className="text-[9px] font-bold text-[#00d2ff]">{pin.unit}</span>
                  </div>
                  {/* Indicator Dot */}
                  <span className="h-2 w-2 rounded-full bg-[#00d2ff] shadow-[0_0_8px_#00d2ff] mt-0.5" />
                </div>
              ))}
            </div>

            {/* Frontal / Back Toggle */}
            <div className="relative z-20 mt-2 flex rounded-xl bg-[#080d16]/90 p-1 border border-white/10 backdrop-blur-md">
              <button
                onClick={() => setViewAngle("frontal")}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewAngle === "frontal" ? "bg-[#0066ff] text-white" : "text-[#94a3b8] hover:text-white"
                }`}
              >
                Frontal
              </button>
              <button
                onClick={() => setViewAngle("espalda")}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  viewAngle === "espalda" ? "bg-[#0066ff] text-white" : "text-[#94a3b8] hover:text-white"
                }`}
              >
                Espalda
              </button>
            </div>
          </div>

          {/* Big Action Button: Registrar Medidas */}
          <button
            onClick={() => setShowModal(true)}
            className="w-full rounded-2xl bg-gradient-to-r from-[#0066ff] to-[#0084ff] py-4 text-sm font-bold text-white shadow-[0_0_25px_rgba(0,102,255,0.7)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" /> Registrar Medidas
          </button>
        </div>
      ) : (
        /* Historial Tab */
        <div className="space-y-3">
          {measurements.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-white/[0.08] bg-[#131926]/60 text-xs text-[#94a3b8]">
              No hay mediciones históricas registradas.
            </div>
          ) : (
            measurements.map(m => (
              <div key={m.id} className="rounded-2xl border border-white/[0.08] bg-[#131926]/70 p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white">
                    {new Date(m.date).toLocaleDateString("es-CO", { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <div className="flex gap-3 text-xs text-[#94a3b8] mt-1">
                    <span>Peso: <strong className="text-white">{m.weight || "ND"} kg</strong></span>
                    <span>% Grasa: <strong className="text-[#00d2ff]">{m.bodyFat ? `${m.bodyFat.toFixed(1)}%` : "ND"}</strong></span>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <span className="text-[#22c55e] font-bold">Cintura: {m.waist || "ND"} cm</span>
                  <p className="text-[10px] text-[#94a3b8] mt-0.5">Brazo: {m.rightArm || "ND"} cm</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal to Register Measurement */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/[0.1] bg-[#131926] p-6 shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-[#94a3b8] hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-display text-xl font-bold text-white mb-4">Nueva Medición Corporal</h3>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-[#94a3b8] block mb-1">Peso (kg)</label>
                  <input name="weight" type="number" step="0.1" defaultValue="83.3" required className="w-full rounded-xl border border-white/10 bg-[#080d16] px-3 py-2 text-sm text-white focus:border-[#0066ff] focus:outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-[#94a3b8] block mb-1">Altura (cm)</label>
                  <input name="height" type="number" step="0.5" defaultValue="178" required className="w-full rounded-xl border border-white/10 bg-[#080d16] px-3 py-2 text-sm text-white focus:border-[#0066ff] focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-[#94a3b8] block mb-1">Pecho (cm)</label>
                  <input name="chest" type="number" step="0.5" defaultValue="105" className="w-full rounded-xl border border-white/10 bg-[#080d16] px-3 py-2 text-sm text-white focus:border-[#0066ff] focus:outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-[#94a3b8] block mb-1">Cintura (cm)</label>
                  <input name="waist" type="number" step="0.5" defaultValue="85" required className="w-full rounded-xl border border-white/10 bg-[#080d16] px-3 py-2 text-sm text-white focus:border-[#0066ff] focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-[#94a3b8] block mb-1">Bíceps D. (cm)</label>
                  <input name="rightArm" type="number" step="0.5" defaultValue="40" className="w-full rounded-xl border border-white/10 bg-[#080d16] px-3 py-2 text-sm text-white focus:border-[#0066ff] focus:outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-[#94a3b8] block mb-1">Muslo D. (cm)</label>
                  <input name="rightThigh" type="number" step="0.5" defaultValue="62" className="w-full rounded-xl border border-white/10 bg-[#080d16] px-3 py-2 text-sm text-white focus:border-[#0066ff] focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-[#94a3b8] block mb-1">Cuello (cm)</label>
                  <input name="neck" type="number" step="0.5" defaultValue="38" className="w-full rounded-xl border border-white/10 bg-[#080d16] px-3 py-2 text-sm text-white focus:border-[#0066ff] focus:outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-[#94a3b8] block mb-1">Cadera (cm)</label>
                  <input name="hip" type="number" step="0.5" defaultValue="98" className="w-full rounded-xl border border-white/10 bg-[#080d16] px-3 py-2 text-sm text-white focus:border-[#0066ff] focus:outline-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#0066ff] py-3.5 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50 transition"
              >
                {loading ? "Guardando..." : "Guardar Medición"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
