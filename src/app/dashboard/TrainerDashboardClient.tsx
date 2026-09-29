"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Users, Dumbbell, Activity, Wallet, TrendingUp, Calendar, CheckCircle2, 
  Clock, AlertCircle, ArrowUpRight, Search, Plus, Sparkles, UserCheck, 
  ChevronRight, ArrowDownRight, Flame
} from "lucide-react";
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie 
} from "recharts";
import { markAttendance } from "@/actions/attendanceActions";

interface TrainerDashboardProps {
  stats: {
    totalClients: number;
    activeClients: number;
    debtorClients: number;
    routinesCount: number;
    exercisesCount: number;
    todayAttendance: number;
    weekAttendance: number;
    totalRevenueMonth: number;
    pendingRevenue: number;
    overduePaymentsCount: number;
  };
  clients: Array<{
    id: string;
    status: string;
    user: { name: string; email: string };
    phone: string | null;
  }>;
  recentAttendances: Array<{
    id: string;
    date: Date;
    client: { user: { name: string } };
  }>;
  recentPayments: Array<{
    id: string;
    amount: number;
    status: string;
    dueDate: Date;
    paymentDate: Date;
    client: { user: { name: string } };
  }>;
  weeklyAttendanceData: Array<{
    day: string;
    asistencias: number;
    meta: number;
  }>;
  revenueData: Array<{
    month: string;
    recaudado: number;
    proyectado: number;
  }>;
}

export function TrainerDashboardClient({
  stats,
  clients,
  recentAttendances,
  recentPayments,
  weeklyAttendanceData,
  revenueData
}: TrainerDashboardProps) {
  const [activeChartTab, setActiveChartTab] = useState<"attendance" | "revenue">("attendance");
  const [searchTerm, setSearchTerm] = useState("");
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [attendanceSuccess, setAttendanceSuccess] = useState<string | null>(null);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  const filteredClients = clients
    .filter(c => c.user.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 5);

  const handleQuickMark = async (clientId: string, clientName: string) => {
    setMarkingId(clientId);
    setAttendanceSuccess(null);
    setAttendanceError(null);
    const res = await markAttendance(clientId);
    setMarkingId(null);
    if (res.success) {
      setAttendanceSuccess(`¡Asistencia registrada para ${clientName}!`);
      setTimeout(() => setAttendanceSuccess(null), 4000);
    } else {
      setAttendanceError(res.error || "Error al registrar asistencia");
      setTimeout(() => setAttendanceError(null), 4000);
    }
  };

  const statusDistribution = [
    { name: "Activos", value: stats.activeClients, color: "#c3f400" },
    { name: "Con Mora", value: stats.debtorClients, color: "#ffb5a0" },
    { name: "Inactivos", value: Math.max(0, stats.totalClients - stats.activeClients - stats.debtorClients), color: "#64748b" }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-r from-[#141a23] via-[#1c2028] to-[#12161f] p-6 md:p-8 shadow-2xl">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-[#c3f400]/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-[#c3f400] animate-pulse" />
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#c3f400]">Panel de Control Central</p>
            </div>
            <h1 className="mt-2 font-display text-3xl md:text-4xl font-black tracking-tight text-white">
              EVOLUTION SPORT GYM
            </h1>
            <p className="mt-1 text-sm text-[#aab1a1]">
              Bienvenido, <span className="text-white font-semibold">Jefferson Cobos</span> · Resumen general y métricas operativas en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link 
              href="/dashboard/clients/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#c3f400] px-4 py-2.5 text-xs md:text-sm font-bold text-[#161e00] shadow-[0_0_20px_-4px_rgba(195,244,0,0.8)] transition hover:brightness-110 active:scale-95"
            >
              <Plus className="h-4 w-4" /> Nuevo Atleta
            </Link>
            <Link 
              href="/dashboard/routines/new"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#1c2028] px-4 py-2.5 text-xs md:text-sm font-bold text-white transition hover:bg-white/5 active:scale-95"
            >
              <Dumbbell className="h-4 w-4 text-[#c3f400]" /> Crear Rutina
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Express Check-in Bar */}
      <div className="rounded-2xl border border-[#c3f400]/20 bg-[#1c2028] p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c3f400]/10 text-[#c3f400]">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-base">Registro Rápido de Asistencia</h3>
              <p className="text-xs text-[#aab1a1]">Busca un atleta para registrar su entrada de hoy al instante.</p>
            </div>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#aab1a1]" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar atleta por nombre..."
              className="w-full rounded-xl border border-white/10 bg-[#0a0e16] pl-10 pr-4 py-2 text-sm text-white placeholder-[#6f786d] focus:border-[#c3f400] focus:outline-none"
            />
          </div>
        </div>

        {/* Feedback Messages */}
        {attendanceSuccess && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#4edea3]/10 border border-[#4edea3]/30 px-3 py-2 text-xs font-semibold text-[#4edea3] animate-fadeIn">
            <CheckCircle2 className="h-4 w-4" /> {attendanceSuccess}
          </div>
        )}
        {attendanceError && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 px-3 py-2 text-xs font-semibold text-rose-400 animate-fadeIn">
            <AlertCircle className="h-4 w-4" /> {attendanceError}
          </div>
        )}

        {/* Client quick list results */}
        {searchTerm.length > 0 && (
          <div className="mt-3 divide-y divide-white/[0.06] rounded-xl border border-white/10 bg-[#0a0e16] p-2">
            {filteredClients.length === 0 ? (
              <p className="p-3 text-center text-xs text-[#aab1a1]">No se encontraron atletas con ese nombre.</p>
            ) : (
              filteredClients.map(c => (
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
                    {markingId === c.id ? "Marcando..." : "Marcar Entrada"}
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Atletas Activos */}
        <Link href="/dashboard/clients" className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1c2028] p-5 transition hover:border-[#c3f400]/50 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#aab1a1]">Atletas Activos</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c3f400]/10 text-[#c3f400] group-hover:scale-110 transition-transform">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-white">{stats.activeClients}</span>
            <span className="text-xs text-[#aab1a1]">de {stats.totalClients} totales</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[#4edea3]">
            <span className="flex items-center gap-1"><ArrowUpRight className="h-3.5 w-3.5" /> {Math.round((stats.activeClients / Math.max(1, stats.totalClients)) * 100)}% tasa activa</span>
            <ChevronRight className="h-4 w-4 text-[#6f786d] group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 2: Asistencias Hoy */}
        <Link href="/dashboard/attendance" className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1c2028] p-5 transition hover:border-[#c3f400]/50 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#aab1a1]">Asistencias Hoy</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4edea3]/10 text-[#4edea3] group-hover:scale-110 transition-transform">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-white">{stats.todayAttendance}</span>
            <span className="text-xs text-[#aab1a1]">entradas hoy</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[#aab1a1]">
            <span>{stats.weekAttendance} esta semana</span>
            <ChevronRight className="h-4 w-4 text-[#6f786d] group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 3: Recaudación Mes */}
        <Link href="/dashboard/payments" className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1c2028] p-5 transition hover:border-[#c3f400]/50 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#aab1a1]">Recaudado Este Mes</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c3f400]/10 text-[#c3f400] group-hover:scale-110 transition-transform">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-2xl font-extrabold text-[#c3f400]">${stats.totalRevenueMonth.toLocaleString("es-CO")}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[#aab1a1]">
            <span>{stats.pendingRevenue > 0 ? `$${stats.pendingRevenue.toLocaleString("es-CO")} por cobrar` : "Todo al día"}</span>
            <ChevronRight className="h-4 w-4 text-[#6f786d] group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 4: Rutinas & Biblioteca */}
        <Link href="/dashboard/routines" className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1c2028] p-5 transition hover:border-[#c3f400]/50 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#aab1a1]">Rutinas Asignadas</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
              <Dumbbell className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-white">{stats.routinesCount}</span>
            <span className="text-xs text-[#aab1a1]">rutinas activas</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-[#aab1a1]">
            <span>{stats.exercisesCount} ejercicios en catálogo</span>
            <ChevronRight className="h-4 w-4 text-[#6f786d] group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Main Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart (Col span 2) */}
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.08] bg-[#1c2028] p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-[#c3f400]">
                <TrendingUp className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Estadísticas Dinámicas</span>
              </div>
              <h2 className="mt-1 font-display text-xl font-bold text-white">
                {activeChartTab === "attendance" ? "Afluencia Semanal de Atletas" : "Evolución Financiera y Proyección"}
              </h2>
            </div>

            {/* Toggle Tabs */}
            <div className="flex items-center rounded-xl bg-[#0a0e16] p-1 border border-white/5">
              <button
                onClick={() => setActiveChartTab("attendance")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeChartTab === "attendance" 
                    ? "bg-[#c3f400] text-[#161e00] shadow-sm" 
                    : "text-[#aab1a1] hover:text-white"
                }`}
              >
                <Activity className="h-3.5 w-3.5" /> Asistencias
              </button>
              <button
                onClick={() => setActiveChartTab("revenue")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  activeChartTab === "revenue" 
                    ? "bg-[#c3f400] text-[#161e00] shadow-sm" 
                    : "text-[#aab1a1] hover:text-white"
                }`}
              >
                <Wallet className="h-3.5 w-3.5" /> Finanzas
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {activeChartTab === "attendance" ? (
                <BarChart data={weeklyAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262a33" vertical={false} />
                  <XAxis dataKey="day" stroke="#6f786d" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6f786d" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0e16', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                    formatter={(val) => [`${val} asistencias`, "Total"]}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#aab1a1' }} />
                  <Bar dataKey="asistencias" name="Asistencias Registradas" fill="#c3f400" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="meta" name="Meta Diaria Esperada" fill="#262a33" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRecaudado" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c3f400" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#c3f400" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262a33" vertical={false} />
                  <XAxis dataKey="month" stroke="#6f786d" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6f786d" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0e16', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                    formatter={(val) => [`$${Number(val).toLocaleString("es-CO")}`, "Ingresos"]}
                  />
                  <Area type="monotone" dataKey="recaudado" name="Recaudado ($)" stroke="#c3f400" strokeWidth={3} fillOpacity={1} fill="url(#colorRecaudado)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Member Status Donut Chart & Distribution */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#1c2028] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#c3f400]">
              <Sparkles className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Composición de Atletas</span>
            </div>
            <h2 className="mt-1 font-display text-xl font-bold text-white">Estado de Membresías</h2>
          </div>

          <div className="h-48 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0e16', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/[0.07]">
            {statusDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[#aab1a1]">{item.name}</span>
                </div>
                <span className="font-bold text-white">{item.value} atletas</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two-Column Feeds: Recent Attendances & Recent Payments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Attendance Feed */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#1c2028] p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#c3f400]" />
              <h3 className="font-display text-lg font-bold text-white">Últimas Asistencias</h3>
            </div>
            <Link href="/dashboard/attendance" className="text-xs font-bold text-[#c3f400] hover:underline flex items-center gap-1">
              Ver todas <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {recentAttendances.length === 0 ? (
              <p className="py-8 text-center text-xs text-[#aab1a1]">No hay asistencias registradas hoy.</p>
            ) : (
              recentAttendances.slice(0, 5).map(att => (
                <div key={att.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c3f400]/10 text-xs font-bold text-[#c3f400]">
                      {att.client.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{att.client.user.name}</p>
                      <p suppressHydrationWarning className="text-xs text-[#aab1a1]">
                        {new Date(att.date).toLocaleDateString("es-CO", { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#4edea3]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#4edea3]">
                    ✓ Presente
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Payments Feed */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#1c2028] p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-[#c3f400]" />
              <h3 className="font-display text-lg font-bold text-white">Últimos Movimientos Financieros</h3>
            </div>
            <Link href="/dashboard/payments" className="text-xs font-bold text-[#c3f400] hover:underline flex items-center gap-1">
              Ver todos <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {recentPayments.length === 0 ? (
              <p className="py-8 text-center text-xs text-[#aab1a1]">No hay transacciones registradas.</p>
            ) : (
              recentPayments.slice(0, 5).map(pay => (
                <div key={pay.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-xs font-bold text-white">
                      {pay.client.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{pay.client.user.name}</p>
                      <p className="text-xs text-[#aab1a1]">
                        Vence: {new Date(pay.dueDate).toLocaleDateString("es-CO")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">${pay.amount.toLocaleString("es-CO")}</p>
                    <span className={`text-[10px] font-bold uppercase ${
                      pay.status === "PAID" ? "text-[#4edea3]" : pay.status === "OVERDUE" ? "text-rose-400" : "text-amber-400"
                    }`}>
                      {pay.status === "PAID" ? "Pagado" : pay.status === "OVERDUE" ? "En Mora" : "Pendiente"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
