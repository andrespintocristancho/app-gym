"use client";

import { useState } from "react";
import { createClient } from "@/actions/clientActions";
import { useRouter } from "next/navigation";
import { UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await createClient(formData);

    if (result.success) {
      router.push("/dashboard/clients");
    } else {
      setError(result.error || "Ocurrió un error");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/dashboard/clients" className="p-2 hover:bg-slate-800 rounded-lg mr-3 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Nuevo Cliente</h1>
            <p className="text-slate-400 text-sm mt-1">Registra un nuevo miembro en el gimnasio</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Nombre Completo</label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej. Juan Pérez"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="juan@ejemplo.com"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Teléfono</label>
              <input
                type="tel"
                name="phone"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+57 300 000 0000"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Contraseña de acceso *</label>
              <input type="password" name="password" minLength={6} required className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#c3f400]" placeholder="Mínimo 6 caracteres" />
              <p className="text-xs text-slate-500">Entrégale este correo y contraseña al cliente para que pueda ingresar.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Edad</label>
                <input
                  type="number"
                  name="age"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej. 25"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Género</label>
                <select
                  name="gender"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMENINO">Femenino</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Observaciones (Lesiones, objetivos)</label>
            <textarea
              name="observations"
              rows={4}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Escribe aquí si el cliente tiene alguna condición médica, lesión u objetivo específico..."
            ></textarea>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
            >
              {loading ? (
                "Guardando..."
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Registrar Cliente
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
