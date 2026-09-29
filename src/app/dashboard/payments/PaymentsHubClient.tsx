"use client";

import { useState, useMemo } from "react";
import { 
  CreditCard, Plus, Search, CheckCircle2, AlertTriangle, 
  Clock, Trash2, X, Wallet, TrendingUp, DollarSign, Calendar 
} from "lucide-react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip 
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { createPayment, updatePaymentStatus, deletePayment } from "@/actions/paymentActions";

interface Payment {
  id: string;
  amount: number;
  paymentDate: Date;
  dueDate: Date;
  status: "PAID" | "PENDING" | "OVERDUE";
  balanceDue: number;
  client: {
    id: string;
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

export function PaymentsHubClient({
  payments: initialPayments,
  clients
}: {
  payments: Payment[];
  clients: ClientOption[];
}) {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PAID" | "PENDING" | "OVERDUE">("ALL");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formClientId, setFormClientId] = useState(clients[0]?.id || "");
  const [formAmount, setFormAmount] = useState("80000");
  const [formDueDate, setFormDueDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [formStatus, setFormStatus] = useState<"PAID" | "PENDING" | "OVERDUE">("PAID");

  // Financial KPI calculations
  const stats = useMemo(() => {
    const totalCollected = payments.filter(p => p.status === "PAID").reduce((sum, p) => sum + p.amount, 0);
    const totalPending = payments.filter(p => p.status === "PENDING" || p.status === "OVERDUE").reduce((sum, p) => sum + p.amount, 0);
    const paidCount = payments.filter(p => p.status === "PAID").length;
    const overdueCount = payments.filter(p => p.status === "OVERDUE").length;
    const pendingCount = payments.filter(p => p.status === "PENDING").length;

    const complianceRate = payments.length > 0 ? Math.round((paidCount / payments.length) * 100) : 100;

    return { totalCollected, totalPending, paidCount, overdueCount, pendingCount, complianceRate };
  }, [payments]);

  // Donut chart data
  const chartData = [
    { name: "Pagados", value: stats.paidCount, color: "#4edea3" },
    { name: "En Mora", value: stats.overdueCount, color: "#f43f5e" },
    { name: "Pendientes", value: stats.pendingCount, color: "#f59e0b" },
  ].filter(d => d.value > 0);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesSearch = 
        p.client.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.client.user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchTerm, statusFilter]);

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClientId || !formAmount || !formDueDate) return;
    setLoading(true);

    const res = await createPayment({
      clientId: formClientId,
      amount: Number(formAmount),
      dueDate: formDueDate,
      status: formStatus
    });

    setLoading(false);
    if (res.success && res.payment) {
      const client = clients.find(c => c.id === formClientId);
      setPayments(prev => [
        {
          id: res.payment.id,
          amount: res.payment.amount,
          paymentDate: new Date(res.payment.paymentDate),
          dueDate: new Date(res.payment.dueDate),
          status: res.payment.status as any,
          balanceDue: res.payment.balanceDue || 0,
          client: {
            id: formClientId,
            user: { name: client?.user.name || "Cliente", email: client?.user.email || "" }
          }
        },
        ...prev
      ]);
      setShowModal(false);
    }
  };

  const handleStatusChange = async (paymentId: string, newStatus: "PAID" | "PENDING" | "OVERDUE") => {
    const res = await updatePaymentStatus(paymentId, newStatus);
    if (res.success) {
      setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: newStatus } : p));
    }
  };

  const handleDelete = async (paymentId: string) => {
    if (!confirm("¿Eliminar este registro de pago?")) return;
    const res = await deletePayment(paymentId);
    if (res.success) {
      setPayments(prev => prev.filter(p => p.id !== paymentId));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#c3f400]">
            <CreditCard className="h-4 w-4" />
            <p className="text-[11px] font-bold uppercase tracking-[0.2em]">Gestión Financiera</p>
          </div>
          <h1 className="mt-1 font-display text-3xl font-black text-white">Control de Pagos y Membresías</h1>
          <p className="text-sm text-[#aab1a1]">
            Historial de cobros, control de vencimientos y registro de abonos.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#c3f400] px-4 py-2.5 text-sm font-bold text-[#161e00] shadow-[0_0_20px_-4px_rgba(195,244,0,0.8)] transition hover:brightness-110 active:scale-95"
        >
          <Plus className="h-4 w-4" /> Registrar Pago
        </button>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Recaudado */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#1c2028] p-5 shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#aab1a1]">Total Recaudado</span>
          <p className="font-display text-2xl font-black text-[#c3f400] mt-1">
            ${stats.totalCollected.toLocaleString("es-CO")}
          </p>
          <span className="text-[10px] text-[#aab1a1] mt-1 block">{stats.paidCount} pagos confirmados</span>
        </div>

        {/* Por Cobrar */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#1c2028] p-5 shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">En Mora / Pendiente</span>
          <p className="font-display text-2xl font-black text-rose-400 mt-1">
            ${stats.totalPending.toLocaleString("es-CO")}
          </p>
          <span className="text-[10px] text-[#aab1a1] mt-1 block">{stats.overdueCount} vencidos</span>
        </div>

        {/* Tasa Cumplimiento */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#1c2028] p-5 shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#4edea3]">Tasa de Cumplimiento</span>
          <p className="font-display text-2xl font-black text-white mt-1">
            {stats.complianceRate}%
          </p>
          <span className="text-[10px] text-[#4edea3] mt-1 block">Efectividad de cobro</span>
        </div>

        {/* Total Registros */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#1c2028] p-5 shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#38bdf8]">Transacciones</span>
          <p className="font-display text-2xl font-black text-white mt-1">
            {payments.length}
          </p>
          <span className="text-[10px] text-[#aab1a1] mt-1 block">Historial registrado</span>
        </div>
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
            placeholder="Buscar por nombre de atleta..."
            className="w-full rounded-xl border border-white/10 bg-[#0a0e16] pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#6f786d] focus:border-[#c3f400] focus:outline-none"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "ALL", label: "Todos" },
            { id: "PAID", label: "Pagados" },
            { id: "PENDING", label: "Pendientes" },
            { id: "OVERDUE", label: "En Mora" },
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

      {/* Payments Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#1c2028] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/[0.08] bg-[#0a0e16]/60 text-[10px] font-bold uppercase tracking-wider text-[#aab1a1]">
              <tr>
                <th className="px-6 py-4">Atleta</th>
                <th className="px-6 py-4">Monto</th>
                <th className="px-6 py-4">Vencimiento</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#aab1a1]">
                    No se encontraron pagos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredPayments.map(pay => (
                  <tr key={pay.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 font-bold text-xs text-white">
                          {pay.client.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{pay.client.user.name}</p>
                          <p className="text-xs text-[#aab1a1]">{pay.client.user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-display font-bold text-white text-base">
                        ${pay.amount.toLocaleString("es-CO")}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-xs text-white">
                        {format(new Date(pay.dueDate), "d MMM, yyyy", { locale: es })}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={pay.status}
                        onChange={(e) => handleStatusChange(pay.id, e.target.value as any)}
                        className={`rounded-full px-2.5 py-1 text-xs font-bold border focus:outline-none cursor-pointer ${
                          pay.status === "PAID"
                            ? "bg-[#4edea3]/10 text-[#4edea3] border-[#4edea3]/30"
                            : pay.status === "OVERDUE"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            : "bg-amber-400/10 text-amber-400 border-amber-400/30"
                        }`}
                      >
                        <option value="PAID" className="bg-[#1c2028] text-white">✓ Pagado</option>
                        <option value="PENDING" className="bg-[#1c2028] text-white">⏳ Pendiente</option>
                        <option value="OVERDUE" className="bg-[#1c2028] text-white">⚠️ En Mora</option>
                      </select>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(pay.id)}
                        className="rounded-lg p-2 text-[#aab1a1] hover:bg-rose-500/10 hover:text-rose-400 transition"
                        title="Eliminar registro"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal to Register Payment */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#1c2028] p-6 shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-[#aab1a1] hover:bg-white/20 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-display text-xl font-bold text-white mb-4">Registrar Pago de Membresía</h3>

            <form onSubmit={handleCreatePayment} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-[#aab1a1] block mb-1">Atleta</label>
                <select
                  value={formClientId}
                  onChange={(e) => setFormClientId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0a0e16] px-3 py-2.5 text-sm text-white focus:border-[#c3f400] focus:outline-none"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.user.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#aab1a1] block mb-1">Monto ($ COP)</label>
                <input
                  type="number"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0a0e16] px-3 py-2.5 text-sm text-white focus:border-[#c3f400] focus:outline-none"
                  placeholder="80000"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#aab1a1] block mb-1">Fecha de Vencimiento</label>
                <input
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0a0e16] px-3 py-2.5 text-sm text-white focus:border-[#c3f400] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-[#aab1a1] block mb-1">Estado</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-white/10 bg-[#0a0e16] px-3 py-2.5 text-sm text-white focus:border-[#c3f400] focus:outline-none"
                >
                  <option value="PAID">Pagado</option>
                  <option value="PENDING">Pendiente</option>
                  <option value="OVERDUE">En Mora</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#c3f400] py-3 font-bold text-[#161e00] text-sm hover:brightness-110 disabled:opacity-50 transition"
              >
                {loading ? "Guardando..." : "Guardar Pago"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
