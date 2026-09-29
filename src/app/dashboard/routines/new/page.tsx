"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getClients } from "@/actions/clientActions";
import { getExercises } from "@/actions/exerciseActions";
import { createRoutine } from "@/actions/routineActions";
import { ArrowLeft, Save, Plus, Trash2, Dumbbell } from "lucide-react";
import Link from "next/link";

export default function NewRoutinePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState("");

  const [clients, setClients] = useState<any[]>([]);
  const [availableExercises, setAvailableExercises] = useState<any[]>([]);
  
  const [routineName, setRoutineName] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [exercises, setExercises] = useState([
    { exerciseId: "", sets: 4, reps: 10, recommendedWeight: "", restTime: "60s", observations: "" }
  ]);

  useEffect(() => {
    async function loadData() {
      const [clientsRes, exercisesRes] = await Promise.all([
        getClients(),
        getExercises()
      ]);

      if (clientsRes.success) setClients(clientsRes.clients || []);
      if (exercisesRes.success) setAvailableExercises(exercisesRes.exercises || []);
      
      setFetchingData(false);
    }
    loadData();
  }, []);

  const handleAddExercise = () => {
    setExercises([...exercises, { exerciseId: "", sets: 4, reps: 10, recommendedWeight: "", restTime: "60s", observations: "" }]);
  };

  const handleSelectExercise = (exerciseId: string) => {
    if (exercises.some((exercise) => exercise.exerciseId === exerciseId)) return;
    setExercises([...exercises, { exerciseId, sets: 4, reps: 10, recommendedWeight: "", restTime: "60s", observations: "" }]);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleExerciseChange = (index: number, field: string, value: string | number) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setExercises(newExercises);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!selectedClientId) {
      setError("Debes seleccionar un cliente");
      setLoading(false);
      return;
    }

    if (exercises.some(ex => !ex.exerciseId)) {
      setError("Todos los ejercicios deben estar seleccionados");
      setLoading(false);
      return;
    }

    let uploadedImageUrl = "";
    if (imageFile) {
      try {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          uploadedImageUrl = uploadData.url;
        } else {
          throw new Error("Fallo al subir la imagen");
        }
      } catch (err) {
        setError("Error al subir la foto de la rutina");
        setLoading(false);
        return;
      }
    }

    const result = await createRoutine({
      name: routineName,
      clientId: selectedClientId,
      imageUrl: uploadedImageUrl || undefined,
      exercises: exercises.map(ex => ({
        exerciseId: ex.exerciseId,
        sets: Number(ex.sets),
        reps: Number(ex.reps),
        recommendedWeight: ex.recommendedWeight ? Number(ex.recommendedWeight) : undefined,
        restTime: ex.restTime,
        observations: ex.observations
      }))
    });

    if (result.success) {
      router.push("/dashboard/routines");
    } else {
      setError(result.error || "Ocurrió un error al crear la rutina.");
      setLoading(false);
    }
  };

  if (fetchingData) {
    return <div className="text-slate-400">Cargando datos...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/routines" className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Nueva Rutina</h1>
          <p className="text-slate-400 mt-1">Crea y asigna una rutina a un cliente</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        {error && (
          <div className="bg-rose-500/10 text-rose-400 p-4 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
                Nombre de la Rutina *
              </label>
              <input
                type="text"
                id="name"
                required
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Ej. Rutina de Hipertrofia (Mes 1)"
              />
            </div>
            
            <div>
              <label htmlFor="client" className="block text-sm font-medium text-slate-300 mb-1">
                Cliente *
              </label>
              <select
                id="client"
                required
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="">Selecciona un cliente...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.user?.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Foto de la Rutina (Opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <div><h2 className="text-lg font-semibold text-white">Selecciona los ejercicios</h2><p className="mt-1 text-xs text-slate-400">Toca una foto para añadirla a esta rutina.</p></div>
              <button
                type="button"
                onClick={handleAddExercise}
                className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Añadir Ejercicio
              </button>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {availableExercises.map((exercise) => {
                const selected = exercises.some((item) => item.exerciseId === exercise.id);
                return <button key={exercise.id} type="button" onClick={() => handleSelectExercise(exercise.id)} className={`overflow-hidden rounded-xl border text-left transition ${selected ? "border-[#c3f400] bg-[#c3f400]/10" : "border-slate-800 bg-slate-950 hover:border-[#c3f400]/60"}`}>
                  <div className="aspect-[4/3] bg-slate-900">{exercise.imageUrl ? <img src={exercise.imageUrl} alt={exercise.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-600"><Dumbbell className="h-8 w-8" /></div>}</div>
                  <div className="p-2.5"><p className="truncate text-xs font-bold text-white">{exercise.name}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400">{selected ? "Seleccionado" : exercise.muscleGroup}</p></div>
                </button>;
              })}
            </div>

            <div className="space-y-4">
              {exercises.map((ex, index) => (
                <div key={index} className="bg-slate-950 border border-slate-800 rounded-lg p-4 relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveExercise(index)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 pr-10">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Ejercicio *
                      </label>
                      <select
                        required
                        value={ex.exerciseId}
                        onChange={(e) => handleExerciseChange(index, "exerciseId", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="">Seleccionar...</option>
                        {availableExercises.map(aEx => (
                          <option key={aEx.id} value={aEx.id}>{aEx.name} ({aEx.muscleGroup})</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Series *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={ex.sets}
                        onChange={(e) => handleExerciseChange(index, "sets", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Repeticiones *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={ex.reps}
                        onChange={(e) => handleExerciseChange(index, "reps", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Descanso
                      </label>
                      <input
                        type="text"
                        value={ex.restTime}
                        onChange={(e) => handleExerciseChange(index, "restTime", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500"
                        placeholder="Ej. 60s"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Peso (kg)
                      </label>
                      <input
                        type="number"
                        value={ex.recommendedWeight}
                        onChange={(e) => handleExerciseChange(index, "recommendedWeight", e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-500"
                        placeholder="Opcional"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {exercises.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-sm border-2 border-dashed border-slate-800 rounded-lg">
                  No has añadido ningún ejercicio. Haz clic en "Añadir Ejercicio" para comenzar.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={loading || exercises.length === 0}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center"
            >
              {loading ? (
                "Guardando..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Rutina
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
