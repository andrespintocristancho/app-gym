"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  ClipboardCheck, Search, Calendar, UserCheck, Flame, 
  TrendingUp, Award, CheckCircle2, AlertCircle, Clock, Eye 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell 
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { markAttendance } from "@/actions/attendanceActions";

interface AttendanceRecord {
  id: string;
  clientId: string;
  date: Date;
  client: {
    user: {
      name: string;
      email: string;
    };
  };
}

interface ClientOption {
  id: string;
  user: {
    name: string;
    email: string;
  };
}

export function AttendanceDashboardClient({
  attendances: initialAttendances,
  clients
}: {
  attendances: AttendanceRecord[];
  clients: ClientOption[];
}) {
  const [attendances, setAttendances] = useState<AttendanceRecord[]>(initialAttendances);
  const [searchTerm, setSearchTerm] = useState("");
  const [quickSearchTerm, setQuickSearchTerm] = useState("");
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; success: boolean } | null>(null);

  // Filtered clients for quick check-in
  const quickClients = useMemo(() => {
    if (!quickSearchTerm.trim()) return [];
    return clients
      .filter(c => c.user.name.toLowerCase().includes(quickSearchTerm.toLowerCase()) || c.user.email.toLowerCase().includes(quickSearchTerm.toLowerCase()))
      .slice(0, 5);
  }, [clients, quickSearchTerm]);

  const handleQuickMark = async (clientId: string, clientName: string) => {
    setMarkingId(clientId);
    setFeedback(null);
    const res = await markAttendance(clientId);
    setMarkingId(null);
    if (res.success && res.attendance) {
      setFeedback({ text: `¡Asistencia confirmada para ${clientName}!`, success: true });
      setAttendances(prev => [
        {
          id: res.attendance.id,
          clientId: res.attendance.clientId,
          date: new Date(res.attendance.date),
          client: { user: { name: clientName, email: "" } }
        },
        ...prev
      ]);
      setQuickSearchTerm("");
      setTimeout(() => setFeedback(null), 4000);
    } else {
      setFeedback({ text: res.error || "Error al marcar asistencia.", success: false });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // Weekly attendance chart aggregation
  const weeklyData = useMemo(() => {
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      const count = attendances.filter(a => {
        const ad = new Date(a.date);
        return ad >= d && ad < nextD;
      }).length;

      return {
        day: days[d.getDay()],
        dateStr: format(d, "dd/MM"),
        asistencias: count
      };
    });
  }, [attendances]);

  // Leaderboard of top disciplined athletes
  const leaderboard = useMemo(() => {
    const counts: Record<string, { name: string; count: number; clientId: string }> = {};
    for (const a of attendances) {
      const name = a.client.user.name;
      if (!counts[name]) counts[name] = { name, count: 0, clientId: a.clientId };
      counts[name].count += 1;
    }
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 4);
  }, [attendances]);

  // Filtered history
  const filteredHistory = useMemo(() => {
    return attendances.filter(a => 
      a.client.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.client.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [attendances, searchTerm]);

  // Stats today
  const todayCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return attendances.filter(a => new Date(a.date) >= today).length;
  }, [attendances]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#c3f400]">
          <ClipboardCheck className="h-4 w-4" />
          <p className="text-[11px] font-bold uppercase tracking-[0.2em]">Control de Acceso y Disciplina</p>
        </div>
        <h1 className="mt-1 font-display text-3xl font-black text-white">Registro de Asistencias</h1>
        <p className="text-sm text-[#aab1a1]">
          Monitoreo de frecuencia de entrenamiento y constancia en Evolution Sport Gym.
        </p>
      </div>

      {/* Quick Check-in Bar */}
      <div className="rounded-2xl border border-[#c3f400]/20 bg-[#1c2028] p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c3f400]/10 text-[#c3f400]">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base">Check-in de Atleta al Gimnasio</h3>
              <p className="text-xs text-[#aab1a1]">Registra la entrada de cualquier atleta en 1 click.</p>
            </div>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#aab1a1]" />
            <input
              type="text"
              value={quickSearchTerm}
              onChange={(e) => setQuickSearchTerm(e.target.value)}
              placeholder="Buscar atleta para registrar entrada..."
              className="w-full rounded-xl border border-white/10 bg-[#0a0e16] pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#6f786d] focus:border-[#c3f400] focus:outline-none"
            />
          </div>
        </div>

        {/* Feedback alert */}
        {feedback && (
          <div className={`mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold animate-fadeIn ${
            feedback.success 
              ? "bg-[#4edea3]/10 border border-[#4edea3]/30 text-[#4edea3]" 
              : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
          }`}>
            {feedback.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {feedback.text}
          </div>
        )}

        {/* Search Results Dropdown */}
        {quickClients.length > 0 && (
          <div className="mt-3 divide-y divide-white/[0.06] rounded-xl border border-white/10 bg-[#0a0e16] p-2">
            {quickClients.map(c => (
              <div key={c.id} className="flex items-center justify-between p-2 hover:bg-white/[0.02] rounded-lg transition-colors">
                <div>
                  <span className="font-semibold text-white text-sm">{c.user.name}</span>
                  <span className="ml-2 text-xs text-[#aab1a1]">{c.user.email}</span>
                </div>
                <button
                  onClick={() => handleQuickMark(c.id, c.user.name)}
                  disabled={markingId === c.id}
                  className="flex items-center gap-1.5 rounded-lg bg-[#c3f400] px-3 py-1.5 text-xs font-bold text-[#161e00] hover:brightness-110 disabled:opacity-50 transition"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {markingId === c.id ? "Registrando..." : "Confirmar Entrada"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* KPI & Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Bar Chart (Span 2) */}
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.08] bg-[#1c2028] p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 text-[#c3f400]">
                <TrendingUp className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Afluencia en el Gimnasio</span>
              </div>
              <h3 className="font-display text-lg font-bold text-white mt-1">Asistencias por Día (Última Semana)</h3>
            </div>
            <span className="rounded-full bg-[#c3f400]/10 px-3 py-1 text-xs font-bold text-[#c3f400]">
              {todayCount} hoy
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262a33" vertical={false} />
                <XAxis dataKey="day" stroke="#6f786d" fontSize={11} tickLine={false} />
                <YAxis stroke="#6f786d" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a0e16', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  formatter={(val) => [`${val} asistencias`, "Total"]}
                />
                <Bar dataKey="asistencias" fill="#c3f400" radius={[6, 6, 0, 0]}>
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 6 ? '#e6ff00' : '#c3f400'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Discipline Leaderboard */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#1c2028] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#f59e0b]">
              <Award className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Ranking de Disciplina</span>
            </div>
            <h3 className="font-display text-lg font-bold text-white mt-1">Top Atletas Más Constantes</h3>
            <p className="text-xs text-[#aab1a1]">Mayor cantidad de sesiones registradas.</p>
          </div>

          <div className="space-y-3 my-4">
            {leaderboard.length === 0 ? (
              <p className="py-6 text-center text-xs text-[#aab1a1]">No hay suficientes registros.</p>
            ) : (
              leaderboard.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a0e16] border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                      idx === 0 ? "bg-amber-400 text-slate-950" : idx === 1 ? "bg-slate-300 text-slate-950" : "bg-amber-700 text-white"
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-white">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-[#c3f400] flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5" /> {item.count} días
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-white/[0.07] text-center">
            <span className="text-[11px] text-[#aab1a1]">La constancia es la clave del progreso.</span>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#1c2028] overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0a0e16]/60">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#aab1a1]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en el historial..."
              className="w-full rounded-xl border border-white/10 bg-[#1c2028] pl-10 pr-4 py-2 text-xs text-white placeholder-[#6f786d] focus:border-[#c3f400] focus:outline-none"
            />
          </div>
          <span className="text-xs text-[#aab1a1]">
            Total registros: <span className="font-bold text-white">{filteredHistory.length}</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/[0.08] bg-[#0a0e16]/40 text-[10px] font-bold uppercase tracking-wider text-[#aab1a1]">
              <tr>
                <th className="px-6 py-4">Atleta</th>
                <th className="px-6 py-4">Fecha & Hora</th>
                <th className="px-6 py-4 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-[#aab1a1]">
                    No se encontraron registros de asistencia.
                  </td>
                </tr>
              ) : (
                filteredHistory.map(record => (
                  <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c3f400]/10 font-bold text-xs text-[#c3f400]">
                          {record.client.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{record.client.user.name}</p>
                          <p className="text-xs text-[#aab1a1]">{record.client.user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-xs text-white font-medium">
                        {format(new Date(record.date), "PPP", { locale: es })}
                      </div>
                      <div className="text-[11px] text-[#aab1a1]">
                        {format(new Date(record.date), "p", { locale: es })}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/clients/${record.clientId}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 hover:bg-[#c3f400]/10 hover:text-[#c3f400] text-white px-3 py-1.5 text-xs font-bold border border-white/5 transition"
                      >
                        <Eye className="h-3.5 w-3.5" /> Ver Atleta
                      </Link>
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
