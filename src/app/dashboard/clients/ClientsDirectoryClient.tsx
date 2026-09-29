"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Users, UserPlus, Search, Phone, Mail, Calendar, 
  ChevronRight, Shield, AlertTriangle, CheckCircle2, 
  XCircle, Dumbbell, Filter, MoreVertical, Eye
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { updateClientStatus } from "@/actions/clientActions";

interface Client {
  id: string;
  phone: string | null;
  inscriptionDate: Date;
  age: number | null;
  gender: string | null;
  status: string;
  observations: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export function ClientsDirectoryClient({
  clients: initialClients,
  isTrainer = false
}: {
  clients: Client[];
  isTrainer: boolean;
}) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "DEBTOR" | "INACTIVE">("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const stats = useMemo(() => {
    return {
      total: clients.length,
      active: clients.filter(c => c.status === "ACTIVE").length,
      debtor: clients.filter(c => c.status === "DEBTOR").length,
      inactive: clients.filter(c => c.status === "INACTIVE").length,
    };
  }, [clients]);

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchesSearch = 
        c.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone && c.phone.includes(searchTerm));
      
      const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [clients, searchTerm, statusFilter]);

  const handleStatusChange = async (clientId: string, newStatus: string) => {
    setUpdatingId(clientId);
    const res = await updateClientStatus(clientId, newStatus);
    setUpdatingId(null);
    if (res.success) {
      setClients(prev => prev.map(c => c.id === clientId ? { ...c, status: newStatus } : c));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#c3f400]">
            <Users className="h-4 w-4" />
            <p className="text-[11px] font-bold uppercase tracking-[0.2em]">Comunidad Evolution</p>
          </div>
          <h1 className="mt-1 font-display text-3xl font-black text-white">Directorio de Atletas</h1>
          <p className="text-sm text-[#aab1a1]">Control general de membresías, contactos y estado físico.</p>
        </div>

        {isTrainer && (
          <Link
            href="/dashboard/clients/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#c3f400] px-4 py-2.5 text-sm font-bold text-[#161e00] shadow-[0_0_20px_-4px_rgba(195,244,0,0.8)] transition hover:brightness-110 active:scale-95"
          >
            <UserPlus className="h-4 w-4" /> Nuevo Atleta
          </Link>
        )}
      </div>

      {/* Stats KPI Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setStatusFilter("ALL")}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === "ALL" ? "border-[#c3f400] bg-[#c3f400]/10" : "border-white/[0.07] bg-[#1c2028] hover:border-white/20"
          }`}
        >
          <span className="text-[10px] font-bold uppercase text-[#aab1a1]">Total Miembros</span>
          <p className="font-display text-2xl font-black text-white mt-1">{stats.total}</p>
        </button>

        <button
          onClick={() => setStatusFilter("ACTIVE")}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === "ACTIVE" ? "border-[#4edea3] bg-[#4edea3]/10" : "border-white/[0.07] bg-[#1c2028] hover:border-white/20"
          }`}
        >
          <span className="text-[10px] font-bold uppercase text-[#4edea3]">Activos</span>
          <p className="font-display text-2xl font-black text-[#4edea3] mt-1">{stats.active}</p>
        </button>

        <button
          onClick={() => setStatusFilter("DEBTOR")}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === "DEBTOR" ? "border-amber-400 bg-amber-400/10" : "border-white/[0.07] bg-[#1c2028] hover:border-white/20"
          }`}
        >
          <span className="text-[10px] font-bold uppercase text-amber-400">Con Mora</span>
          <p className="font-display text-2xl font-black text-amber-400 mt-1">{stats.debtor}</p>
        </button>

        <button
          onClick={() => setStatusFilter("INACTIVE")}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === "INACTIVE" ? "border-slate-500 bg-slate-500/10" : "border-white/[0.07] bg-[#1c2028] hover:border-white/20"
          }`}
        >
          <span className="text-[10px] font-bold uppercase text-slate-400">Inactivos</span>
          <p className="font-display text-2xl font-black text-slate-400 mt-1">{stats.inactive}</p>
        </button>
      </div>

      {/* Interactive Controls Bar */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#1c2028] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#aab1a1]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, correo o teléfono..."
            className="w-full rounded-xl border border-white/10 bg-[#0a0e16] pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#6f786d] focus:border-[#c3f400] focus:outline-none"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "ALL", label: "Todos" },
            { id: "ACTIVE", label: "Activos" },
            { id: "DEBTOR", label: "Con Mora" },
            { id: "INACTIVE", label: "Inactivos" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-[#c3f400] text-[#161e00]"
                  : "text-[#aab1a1] hover:text-white bg-[#0a0e16] border border-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#1c2028] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/[0.08] bg-[#0a0e16]/60 text-[10px] font-bold uppercase tracking-wider text-[#aab1a1]">
              <tr>
                <th className="px-6 py-4">Atleta</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Inscripción</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#aab1a1]">
                    No se encontraron atletas con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredClients.map(client => (
                  <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c3f400]/10 font-display font-bold text-sm text-[#c3f400] flex-shrink-0">
                          {client.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white group-hover:text-[#c3f400] transition-colors">
                            {client.user.name}
                          </p>
                          <p className="text-xs text-[#aab1a1] mt-0.5">
                            {client.age ? `${client.age} años` : "Edad no reg."} {client.gender ? `· ${client.gender}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5 text-xs">
                        <span className="text-white flex items-center gap-1">
                          <Phone className="h-3 w-3 text-[#aab1a1]" /> {client.phone || "Sin teléfono"}
                        </span>
                        <span className="text-[#aab1a1] flex items-center gap-1">
                          <Mail className="h-3 w-3 text-[#6f786d]" /> {client.user.email}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-xs text-white">
                        {format(new Date(client.inscriptionDate), "d MMM, yyyy", { locale: es })}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {isTrainer ? (
                        <select
                          value={client.status}
                          disabled={updatingId === client.id}
                          onChange={(e) => handleStatusChange(client.id, e.target.value)}
                          className={`rounded-full px-2.5 py-1 text-xs font-bold border focus:outline-none cursor-pointer ${
                            client.status === "ACTIVE" 
                              ? "bg-[#4edea3]/10 text-[#4edea3] border-[#4edea3]/30" 
                              : client.status === "DEBTOR"
                              ? "bg-amber-400/10 text-amber-400 border-amber-400/30"
                              : "bg-slate-500/10 text-slate-400 border-slate-500/30"
                          }`}
                        >
                          <option value="ACTIVE" className="bg-[#1c2028] text-white">Activo</option>
                          <option value="DEBTOR" className="bg-[#1c2028] text-white">Con Mora</option>
                          <option value="INACTIVE" className="bg-[#1c2028] text-white">Inactivo</option>
                        </select>
                      ) : (
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold border ${
                          client.status === "ACTIVE" 
                            ? "bg-[#4edea3]/10 text-[#4edea3] border-[#4edea3]/30" 
                            : client.status === "DEBTOR"
                            ? "bg-amber-400/10 text-amber-400 border-amber-400/30"
                            : "bg-slate-500/10 text-slate-400 border-slate-500/30"
                        }`}>
                          {client.status === "ACTIVE" ? "Activo" : client.status === "DEBTOR" ? "Con Mora" : "Inactivo"}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/clients/${client.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 hover:bg-[#c3f400]/10 hover:text-[#c3f400] text-white px-3 py-1.5 text-xs font-bold border border-white/5 transition"
                        >
                          <Eye className="h-3.5 w-3.5" /> Ver Perfil
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
