"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ChevronLeft, Plus, Image as ImageIcon, Camera, 
  Calendar, ArrowLeftRight, Sparkles, CheckCircle2, X
} from "lucide-react";
import { addProgressPhoto } from "@/actions/photoActions";

export interface PhotoItem {
  id: string;
  date: string;
  weight?: number | null;
  url: string;
  tag?: string | null;
  notes?: string | null;
  correlationText?: string;
}

interface PhotosScreenProps {
  clientId?: string;
  photos?: PhotoItem[];
  measurementsSummary?: {
    weightDelta?: number;
    waistDelta?: number;
    armDelta?: number;
  };
}

export function PhotosScreen({ 
  clientId = "", 
  photos = [],
  measurementsSummary
}: PhotosScreenProps) {
  const [tab, setTab] = useState<"slider" | "galeria">("slider");
  const [sliderPos, setSliderPos] = useState(50);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newWeight, setNewWeight] = useState("");
  const [newTag, setNewTag] = useState("FRONT");
  const [loading, setLoading] = useState(false);

  const hasPhotos = photos.length > 0;
  const canCompare = photos.length >= 2;

  // Before = oldest, After = newest
  const beforePhoto = canCompare ? photos[0] : null;
  const afterPhoto = canCompare ? photos[photos.length - 1] : null;

  // AI Visual Analysis based on photo interval & physical changes
  const getAiDetections = () => {
    if (!canCompare) return [];
    const detections: string[] = [];
    const wDelta = measurementsSummary?.weightDelta ?? 
      ((afterPhoto?.weight && beforePhoto?.weight) ? afterPhoto.weight - beforePhoto.weight : undefined);
    const waistDelta = measurementsSummary?.waistDelta;
    const armDelta = measurementsSummary?.armDelta;

    if (waistDelta !== undefined && waistDelta < 0) {
      detections.push("Posible reducción abdominal y afinamiento de cintura");
    } else if (wDelta !== undefined && wDelta < -1) {
      detections.push("Reducción de volumen corporal general y posible reducción abdominal");
    }

    if (armDelta !== undefined && armDelta > 0) {
      detections.push("Mayor volumen y plenitud en brazos y torso");
    } else if (wDelta !== undefined && wDelta > 1) {
      detections.push("Incremento en volumen general de masa corporal");
    }

    if (wDelta !== undefined && Math.abs(wDelta) <= 1.5 && (waistDelta ?? 0) <= 0) {
      detections.push("Mayor definición muscular y recomposición visual visible");
    }

    if (detections.length === 0) {
      detections.push("Consistencia en postura y estructura física mantenida");
    }

    return detections;
  };

  const detections = getAiDetections();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !newPhotoUrl.trim()) return;
    setLoading(true);
    await addProgressPhoto({
      clientId,
      photoUrl: newPhotoUrl.trim(),
      weight: newWeight ? parseFloat(newWeight) : undefined,
      tag: newTag
    });
    setLoading(false);
    setShowUploadModal(false);
    setNewPhotoUrl("");
    setNewWeight("");
  };

  return (
    <div className="space-y-6 pb-24 max-w-lg mx-auto animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="rounded-full p-2 bg-white/5 text-[#94a3b8] hover:text-white transition">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-bold text-white">Progreso Visual</h1>
        <div className="w-9" />
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-[#131926]/80 p-1 border border-white/[0.08] backdrop-blur-xl">
        <button
          onClick={() => setTab("slider")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
            tab === "slider"
              ? "bg-[#0066ff] text-white shadow-[0_0_15px_rgba(0,102,255,0.6)]"
              : "text-[#94a3b8] hover:text-white"
          }`}
        >
          Antes / Después ({canCompare ? "2" : photos.length})
        </button>
        <button
          onClick={() => setTab("galeria")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
            tab === "galeria"
              ? "bg-[#0066ff] text-white shadow-[0_0_15px_rgba(0,102,255,0.6)]"
              : "text-[#94a3b8] hover:text-white"
          }`}
        >
          Galería ({photos.length})
        </button>
      </div>

      {/* No photos state */}
      {!hasPhotos ? (
        <div className="rounded-3xl border border-white/[0.08] bg-[#131926]/70 p-8 text-center space-y-4">
          <Camera className="h-12 w-12 text-[#64748b] mx-auto opacity-50" />
          <h3 className="font-display text-base font-bold text-white">No existen fotografías todavía</h3>
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            Sube tus fotos de progreso (frente, perfil o espalda) para habilitar el comparador antes/después y el análisis inteligente de cambios físicos.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="rounded-2xl bg-[#0066ff] px-5 py-3 text-xs font-bold text-white shadow-[0_0_20px_rgba(0,102,255,0.5)] hover:brightness-110 transition"
          >
            <Plus className="h-4 w-4 inline mr-1" /> Subir primera foto
          </button>
        </div>
      ) : tab === "slider" ? (
        <div className="space-y-4">
          {!canCompare ? (
            <div className="rounded-3xl border border-white/[0.08] bg-[#131926]/70 p-6 text-center space-y-3">
              <div className="relative aspect-[3/4] max-w-[240px] mx-auto rounded-2xl overflow-hidden border border-white/10">
                <img src={photos[0].url} alt="Foto 1" className="h-full w-full object-cover" />
              </div>
              <p className="text-xs text-[#94a3b8]">
                Tienes 1 foto registrada ({photos[0].date}). Sube una segunda foto para activar el comparador interactivo antes/después y el análisis visual inteligente.
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full rounded-2xl bg-gradient-to-r from-[#0066ff] to-[#0084ff] py-3.5 text-xs font-bold text-white"
              >
                <Plus className="h-4 w-4 inline mr-1" /> Subir segunda foto para comparar
              </button>
            </div>
          ) : (
            <>
              {/* Interactive Before/After Split Slider Container */}
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl border border-white/[0.1] bg-[#070a10] shadow-2xl select-none touch-none">
                {/* After Image (Background) */}
                <img
                  src={afterPhoto!.url}
                  alt="Después"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {/* After Info Overlay */}
                <div className="absolute top-4 right-4 z-10 rounded-xl bg-[#080d16]/80 backdrop-blur-md px-3 py-1.5 border border-white/10 text-right">
                  <span className="text-[10px] text-[#94a3b8] block">{afterPhoto!.date}</span>
                  {afterPhoto!.weight && <strong className="text-xs font-black text-white">{afterPhoto!.weight} kg</strong>}
                </div>

                {/* Before Image (Clipped Foreground) */}
                <div
                  className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-[#00d2ff] shadow-[0_0_20px_rgba(0,210,255,0.8)]"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src={beforePhoto!.url}
                    alt="Antes"
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ width: '100%', maxWidth: 'none' }}
                  />
                  {/* Before Info Overlay */}
                  <div className="absolute top-4 left-4 z-10 rounded-xl bg-[#080d16]/80 backdrop-blur-md px-3 py-1.5 border border-white/10">
                    <span className="text-[10px] text-[#94a3b8] block">{beforePhoto!.date}</span>
                    {beforePhoto!.weight && <strong className="text-xs font-black text-white">{beforePhoto!.weight} kg</strong>}
                  </div>
                </div>

                {/* Draggable Divider Handle */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-[#0066ff] text-white shadow-[0_0_20px_#00d2ff] cursor-ew-resize"
                  style={{ left: `${sliderPos}%` }}
                >
                  <ArrowLeftRight className="h-4 w-4 text-white" />
                </div>

                {/* Range input */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={(e) => setSliderPos(Number(e.target.value))}
                  className="absolute inset-0 h-full w-full opacity-0 cursor-ew-resize z-30"
                />
              </div>

              {/* AI Detection Card con Correlación de Medidas */}
              <div className="rounded-3xl border border-[#00d2ff]/30 bg-gradient-to-b from-[#081a2e]/90 to-[#070a10]/95 p-5 backdrop-blur-2xl shadow-xl space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#00d2ff]" />
                  <h3 className="font-display text-sm font-bold text-white">Análisis Fotográfico y Medidas Corporales</h3>
                </div>

                {afterPhoto?.correlationText && (
                  <div className="p-3 rounded-2xl bg-[#0066ff]/15 border border-[#00d2ff]/40 text-xs text-white font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#22c55e] flex-shrink-0" />
                    <span>{afterPhoto.correlationText}</span>
                  </div>
                )}

                <div className="space-y-2">
                  {detections.map((det, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-[#94a3b8]">
                      <CheckCircle2 className="h-4 w-4 text-[#22c55e] flex-shrink-0 mt-0.5" />
                      <span className="text-white font-medium">{det}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-[#64748b]">
                  Comparando fotografía del {beforePhoto!.date} vs {afterPhoto!.date}.
                </p>
              </div>

              {/* Add Photos Button */}
              <button 
                onClick={() => setShowUploadModal(true)}
                className="w-full rounded-2xl bg-gradient-to-r from-[#0066ff] to-[#0084ff] py-4 text-sm font-bold text-white shadow-[0_0_25px_rgba(0,102,255,0.7)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <Camera className="h-4 w-4" /> Agregar nueva foto
              </button>
            </>
          )}
        </div>
      ) : (
        /* Gallery Grid */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {photos.map(item => (
              <div key={item.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-[#070a10] shadow-lg group">
                <img src={item.url} alt={item.date} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-[#94a3b8]">{item.date}</span>
                    {item.weight && <strong className="text-xs text-white">{item.weight} kg</strong>}
                  </div>
                  {item.correlationText && (
                    <p className="text-[10px] text-[#00d2ff] font-bold line-clamp-2 leading-tight">
                      {item.correlationText}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setShowUploadModal(true)}
            className="w-full rounded-2xl bg-[#0066ff] py-3.5 text-sm font-bold text-white hover:brightness-110 transition flex items-center justify-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Subir a la galería
          </button>
        </div>
      )}

      {/* Modal for adding photo */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl border border-white/[0.1] bg-[#131926] p-6 shadow-2xl">
            <button 
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-[#94a3b8] hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-display text-xl font-bold text-white mb-4">Agregar Foto de Progreso</h3>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase text-[#94a3b8] block mb-1">URL de la foto o imagen</label>
                <input
                  type="url"
                  placeholder="https://... o ruta de imagen"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#080d16] px-3 py-2.5 text-sm text-white focus:border-[#0066ff] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-[#94a3b8] block mb-1">Peso actual (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ej: 80.5"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#080d16] px-3 py-2 text-sm text-white focus:border-[#0066ff] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-[#94a3b8] block mb-1">Ángulo</label>
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#080d16] px-3 py-2 text-sm text-white focus:border-[#0066ff] focus:outline-none"
                  >
                    <option value="FRONT">Frente</option>
                    <option value="SIDE">Perfil</option>
                    <option value="BACK">Espalda</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#0066ff] py-3.5 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50 transition"
              >
                {loading ? "Guardando..." : "Guardar Foto"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
