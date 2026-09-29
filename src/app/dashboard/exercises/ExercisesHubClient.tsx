"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Dumbbell, Plus, Search, Info, AlertTriangle, CheckCircle2, 
  X, Image as ImageIcon, Sparkles, Filter, Play, Layers
} from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  imageUrl: string | null;
  description: string | null;
  technique: string | null;
  commonErrors: string | null;
}

export function ExercisesHubClient({
  exercises,
  isTrainer = false
}: {
  exercises: Exercise[];
  isTrainer?: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState<string>("ALL");
  const [activeModalExercise, setActiveModalExercise] = useState<Exercise | null>(null);

  const muscleGroups = useMemo(() => {
    const groups = Array.from(new Set(exercises.map(e => e.muscleGroup))).filter(Boolean);
    return groups;
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    return exercises.filter(e => {
      const matchesSearch = 
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.technique && e.technique.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesMuscle = selectedMuscle === "ALL" || e.muscleGroup === selectedMuscle;
      return matchesSearch && matchesMuscle;
    });
  }, [exercises, searchTerm, selectedMuscle]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#c3f400]">
            <Dumbbell className="h-4 w-4" />
            <p className="text-[11px] font-bold uppercase tracking-[0.2em]">Biblioteca de Técnica y Movimiento</p>
          </div>
          <h1 className="mt-1 font-display text-3xl font-black text-white">Catálogo de Ejercicios</h1>
          <p className="text-sm text-[#aab1a1]">
            Guías paso a paso, fotos y advertencias de técnica para cada patrón biomecánico.
          </p>
        </div>

        {isTrainer && (
          <Link
            href="/dashboard/exercises/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#c3f400] px-4 py-2.5 text-sm font-bold text-[#161e00] shadow-[0_0_20px_-4px_rgba(195,244,0,0.8)] transition hover:brightness-110 active:scale-95"
          >
            <Plus className="h-4 w-4" /> Nuevo Ejercicio
          </Link>
        )}
      </div>

      {/* Muscle Group Statistics Overview */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#1c2028] p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-[#aab1a1] uppercase tracking-wider">Distribución por Grupo Muscular</span>
          <span className="text-xs font-bold text-[#c3f400]">{exercises.length} ejercicios totales</span>
        </div>

        {/* Muscle pills filter */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => setSelectedMuscle("ALL")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
              selectedMuscle === "ALL" 
                ? "bg-[#c3f400] text-[#161e00] shadow-sm" 
                : "bg-[#0a0e16] text-[#aab1a1] hover:text-white border border-white/5"
            }`}
          >
            Todos ({exercises.length})
          </button>
          {muscleGroups.map(group => {
            const count = exercises.filter(e => e.muscleGroup === group).length;
            const isSelected = selectedMuscle === group;
            return (
              <button
                key={group}
                onClick={() => setSelectedMuscle(group)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  isSelected 
                    ? "bg-[#c3f400] text-[#161e00] shadow-sm" 
                    : "bg-[#0a0e16] text-[#aab1a1] hover:text-white border border-white/5"
                }`}
              >
                {group} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#aab1a1]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar ejercicio por nombre o técnica..."
          className="w-full rounded-xl border border-white/10 bg-[#1c2028] pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#6f786d] focus:border-[#c3f400] focus:outline-none shadow-md"
        />
      </div>

      {/* Grid of Exercises */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredExercises.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-white/[0.08] bg-[#1c2028] p-12 text-center">
            <Dumbbell className="mx-auto mb-4 h-12 w-12 text-[#6f786d]" />
            <h3 className="font-display text-lg font-bold text-white mb-1">No se encontraron ejercicios</h3>
            <p className="text-xs text-[#aab1a1]">Prueba ajustando el filtro de búsqueda o el grupo muscular.</p>
          </div>
        ) : (
          filteredExercises.map(exercise => (
            <div
              key={exercise.id}
              onClick={() => setActiveModalExercise(exercise)}
              className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1c2028] shadow-lg hover:border-[#c3f400]/40 transition-all cursor-pointer group"
            >
              {/* Image Preview */}
              <div className="relative aspect-video w-full overflow-hidden bg-[#0a0e16] border-b border-white/[0.06]">
                {exercise.imageUrl ? (
                  <img
                    src={exercise.imageUrl}
                    alt={exercise.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-[#6f786d]">
                    <ImageIcon className="h-8 w-8 opacity-40 mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Foto de referencia</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 rounded-full bg-[#0a0e16]/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold uppercase text-[#c3f400] border border-white/10">
                  {exercise.muscleGroup}
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-base font-bold text-white group-hover:text-[#c3f400] transition-colors">
                  {exercise.name}
                </h3>
                
                {exercise.description && (
                  <p className="mt-2 line-clamp-2 text-xs text-[#aab1a1] leading-relaxed">
                    {exercise.description}
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#c3f400]">
                  <span className="font-semibold flex items-center gap-1">
                    <Info className="h-3.5 w-3.5" /> Ver Técnica y Pasos
                  </span>
                  <span className="text-[10px] text-[#aab1a1]">Click para abrir</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Interactive Detail Modal */}
      {activeModalExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/[0.1] bg-[#1c2028] p-6 shadow-2xl">
            <button
              onClick={() => setActiveModalExercise(null)}
              className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-[#aab1a1] hover:bg-white/20 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-[#c3f400]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#c3f400]">
                {activeModalExercise.muscleGroup}
              </span>
            </div>
            <h2 className="font-display text-2xl font-black text-white">{activeModalExercise.name}</h2>

            {/* Image */}
            {activeModalExercise.imageUrl && (
              <div className="relative my-4 aspect-video w-full overflow-hidden rounded-xl bg-[#0a0e16] border border-white/10">
                <img
                  src={activeModalExercise.imageUrl}
                  alt={activeModalExercise.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Description */}
            {activeModalExercise.description && (
              <div className="mb-4">
                <h4 className="text-xs font-bold uppercase text-[#aab1a1] tracking-wider mb-1">Descripción</h4>
                <p className="text-sm text-slate-200 leading-relaxed">{activeModalExercise.description}</p>
              </div>
            )}

            {/* Technique Execution */}
            {activeModalExercise.technique && (
              <div className="mb-4 rounded-xl bg-[#0a0e16] border border-[#c3f400]/20 p-4">
                <div className="flex items-center gap-2 text-[#c3f400] mb-2 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="h-4 w-4" /> Pasos de Ejecución Correcta
                </div>
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {activeModalExercise.technique}
                </p>
              </div>
            )}

            {/* Common Mistakes */}
            {activeModalExercise.commonErrors && (
              <div className="mb-4 rounded-xl bg-[#0a0e16] border border-rose-500/20 p-4">
                <div className="flex items-center gap-2 text-rose-400 mb-2 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="h-4 w-4" /> Errores Comunes a Evitar
                </div>
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {activeModalExercise.commonErrors}
                </p>
              </div>
            )}

            <button
              onClick={() => setActiveModalExercise(null)}
              className="mt-2 w-full rounded-xl bg-[#c3f400] py-3 text-sm font-bold text-[#161e00] hover:brightness-110 transition"
            >
              Cerrar Guía
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
