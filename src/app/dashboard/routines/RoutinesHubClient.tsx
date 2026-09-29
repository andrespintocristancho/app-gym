"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Dumbbell, Plus, Search, Calendar, User, ChevronRight, 
  Layers, CheckCircle2, Clock, Trash2, Eye 
} from "lucide-react";
import { deleteRoutine } from "@/actions/routineActions";

interface RoutineExercise {
  id: string;
  sets: number;
  reps: number;
  recommendedWeight: number | null;
  restTime: string | null;
  observations: string | null;
  exercise: {
    name: string;
    muscleGroup: string;
    imageUrl: string | null;
  };
}

interface Routine {
  id: string;
  name: string;
  imageUrl: string | null;
  createdAt: Date;
  client: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
  exercises: RoutineExercise[];
}

export function RoutinesHubClient({
  routines: initialRoutines,
  isTrainer = false
}: {
  routines: Routine[];
  isTrainer?: boolean;
}) {
  const [routines, setRoutines] = useState<Routine[]>(initialRoutines);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);

  const filteredRoutines = useMemo(() => {
    return routines.filter(r => 
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.client.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [routines, searchTerm]);

  const handleDelete = async (routineId: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta rutina?")) return;
    const res = await deleteRoutine(routineId);
    if (res.success) {
      setRoutines(prev => prev.filter(r => r.id !== routineId));
      if (selectedRoutine?.id === routineId) setSelectedRoutine(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#c3f400]">
            <Dumbbell className="h-4 w-4" />
            <p className="text-[11px] font-bold uppercase tracking-[0.2em]">Programación de Entreno</p>
          </div>
          <h1 className="mt-1 font-display text-3xl font-black text-white">Planes y Rutinas</h1>
          <p className="text-sm text-[#aab1a1]">
            Asignación de series, repeticiones y cargas personalizadas por atleta.
          </p>
        </div>

        {isTrainer && (
          <Link
            href="/dashboard/routines/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#c3f400] px-4 py-2.5 text-sm font-bold text-[#161e00] shadow-[0_0_20px_-4px_rgba(195,244,0,0.8)] transition hover:brightness-110 active:scale-95"
          >
            <Plus className="h-4 w-4" /> Nueva Rutina
          </Link>
        )}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#aab1a1]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar rutina por nombre o atleta..."
          className="w-full rounded-xl border border-white/10 bg-[#1c2028] pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#6f786d] focus:border-[#c3f400] focus:outline-none shadow-md"
        />
      </div>

      {/* Grid of Routines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoutines.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-white/[0.08] bg-[#1c2028] p-12 text-center">
            <Dumbbell className="mx-auto mb-4 h-12 w-12 text-[#6f786d]" />
            <h3 className="font-display text-lg font-bold text-white mb-1">No hay rutinas</h3>
            <p className="text-xs text-[#aab1a1]">Crea una nueva rutina para asignarla a un atleta.</p>
          </div>
        ) : (
          filteredRoutines.map(routine => {
            const muscleGroups = Array.from(new Set(routine.exercises.map(e => e.exercise.muscleGroup)));
            return (
              <div
                key={routine.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1c2028] shadow-xl hover:border-[#c3f400]/40 transition-all"
              >
                {/* Image Banner */}
                {routine.imageUrl && (
                  <div className="relative h-36 w-full overflow-hidden bg-[#0a0e16] border-b border-white/10">
                    <img
                      src={routine.imageUrl}
                      alt={routine.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-display text-lg font-bold text-white">{routine.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-[#aab1a1] mt-1">
                        <User className="h-3.5 w-3.5 text-[#c3f400]" />
                        <span>{routine.client?.user?.name || "Sin asignar"}</span>
                      </div>
                    </div>
                    {isTrainer && (
                      <button
                        onClick={() => handleDelete(routine.id)}
                        className="rounded-lg p-1.5 text-[#aab1a1] hover:bg-rose-500/10 hover:text-rose-400 transition"
                        title="Eliminar rutina"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Muscle tags */}
                  <div className="flex flex-wrap gap-1.5 my-3">
                    {muscleGroups.slice(0, 3).map(m => (
                      <span key={m} className="rounded-full bg-[#0a0e16] border border-white/10 px-2 py-0.5 text-[10px] font-bold text-[#c3f400]">
                        {m}
                      </span>
                    ))}
                    {muscleGroups.length > 3 && (
                      <span className="rounded-full bg-[#0a0e16] border border-white/10 px-2 py-0.5 text-[10px] font-bold text-[#aab1a1]">
                        +{muscleGroups.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Exercises mini preview */}
                  <div className="space-y-1.5 border-t border-white/[0.06] pt-3 my-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#aab1a1] block mb-1">
                      {routine.exercises.length} Ejercicios incluidos:
                    </span>
                    {routine.exercises.slice(0, 3).map(re => (
                      <div key={re.id} className="flex items-center justify-between text-xs text-[#aab1a1]">
                        <span className="truncate pr-2 text-white">{re.exercise.name}</span>
                        <span className="font-bold text-[#c3f400] shrink-0">{re.sets} x {re.reps}</span>
                      </div>
                    ))}
                    {routine.exercises.length > 3 && (
                      <p className="text-[10px] text-[#6f786d] italic">
                        +{routine.exercises.length - 3} ejercicios más...
                      </p>
                    )}
                  </div>

                  {/* Footer button */}
                  <div className="mt-auto pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <button
                      onClick={() => setSelectedRoutine(routine)}
                      className="text-xs font-bold text-[#c3f400] hover:underline flex items-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" /> Ver Rutina Completa
                    </button>
                    <span className="text-[10px] text-[#aab1a1]">
                      {new Date(routine.createdAt).toLocaleDateString("es-CO")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Routine Detail Modal */}
      {selectedRoutine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/[0.1] bg-[#1c2028] p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c3f400]">Plan de Entrenamiento</span>
                <h2 className="font-display text-2xl font-black text-white mt-0.5">{selectedRoutine.name}</h2>
                <p className="text-xs text-[#aab1a1] mt-1">Asignada a: <span className="text-white font-bold">{selectedRoutine.client?.user?.name}</span></p>
              </div>
              <button
                onClick={() => setSelectedRoutine(null)}
                className="rounded-full bg-white/10 p-2 text-[#aab1a1] hover:bg-white/20 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Exercises List */}
            <div className="space-y-3 my-4">
              {selectedRoutine.exercises.map((item, index) => (
                <div key={item.id} className="rounded-xl bg-[#0a0e16] border border-white/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c3f400]/10 font-bold text-xs text-[#c3f400]">
                      {index + 1}
                    </div>
                    {item.exercise.imageUrl && (
                      <img
                        src={item.exercise.imageUrl}
                        alt={item.exercise.name}
                        className="h-12 w-12 rounded-lg object-cover border border-white/10"
                      />
                    )}
                    <div>
                      <span className="text-[9px] font-bold uppercase text-[#c3f400]">{item.exercise.muscleGroup}</span>
                      <h4 className="text-sm font-bold text-white">{item.exercise.name}</h4>
                      {item.observations && <p className="text-xs text-[#aab1a1] mt-0.5">{item.observations}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs flex-wrap sm:flex-nowrap">
                    <span className="rounded-lg bg-[#1c2028] px-2.5 py-1 text-white font-bold">
                      {item.sets} series
                    </span>
                    <span className="rounded-lg bg-[#1c2028] px-2.5 py-1 text-white font-bold">
                      {item.reps} reps
                    </span>
                    {item.recommendedWeight != null && (
                      <span className="rounded-lg bg-[#c3f400]/10 px-2.5 py-1 text-[#c3f400] font-bold">
                        {item.recommendedWeight} kg
                      </span>
                    )}
                    {item.restTime && (
                      <span className="rounded-lg bg-[#1c2028] px-2.5 py-1 text-[#aab1a1]">
                        ⏱ {item.restTime}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedRoutine(null)}
              className="mt-4 w-full rounded-xl bg-[#c3f400] py-3 text-sm font-bold text-[#161e00] hover:brightness-110 transition"
            >
              Cerrar Vista
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
