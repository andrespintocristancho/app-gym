"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createExercise } from "@/actions/exerciseActions";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewExercisePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      muscleGroup: formData.get("muscleGroup") as string,
      imageUrl: formData.get("imageUrl") as string,
      description: formData.get("description") as string,
      technique: formData.get("technique") as string,
      commonErrors: formData.get("commonErrors") as string,
    };

    const result = await createExercise(data);

    if (result.success) {
      router.push("/dashboard/exercises");
    } else {
      setError(result.error || "Ocurrió un error al crear el ejercicio.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/exercises" className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Nuevo Ejercicio</h1>
          <p className="text-slate-400 mt-1">Registra un nuevo ejercicio en el catálogo</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        {error && (
          <div className="bg-rose-500/10 text-rose-400 p-4 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
                Nombre del Ejercicio *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Ej. Press de Banca"
              />
            </div>
            
            <div>
              <label htmlFor="muscleGroup" className="block text-sm font-medium text-slate-300 mb-1">
                Grupo Muscular *
              </label>
              <select
                id="muscleGroup"
                name="muscleGroup"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                <option value="">Selecciona un grupo...</option>
                <option value="Pecho">Pecho</option>
                <option value="Espalda">Espalda</option>
                <option value="Piernas">Piernas</option>
                <option value="Hombros">Hombros</option>
                <option value="Brazos">Brazos</option>
                <option value="Core/Abdomen">Core / Abdomen</option>
                <option value="Cardio">Cardio</option>
                <option value="Full Body">Full Body</option>
              </select>
            </div>
          </div>

          <div>
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-slate-300 mb-1">
                URL de Imagen / Foto del ejercicio
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="https://ejemplo.com/foto.jpg"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">
              Descripción Breve
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
              placeholder="Descripción del propósito del ejercicio..."
            />
          </div>
          
          <div>
            <label htmlFor="technique" className="block text-sm font-medium text-slate-300 mb-1">
              Técnica de Ejecución
            </label>
            <textarea
              id="technique"
              name="technique"
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
              placeholder="Instrucciones paso a paso..."
            />
          </div>

          <div>
            <label htmlFor="commonErrors" className="block text-sm font-medium text-slate-300 mb-1">
              Errores Comunes
            </label>
            <textarea
              id="commonErrors"
              name="commonErrors"
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
              placeholder="Errores a evitar..."
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center"
            >
              {loading ? (
                "Guardando..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Ejercicio
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
