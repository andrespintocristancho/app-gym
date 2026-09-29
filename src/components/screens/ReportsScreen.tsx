"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ChevronLeft, Share2, CheckCircle2, Scale, Dumbbell, 
  Sparkles, Zap, FileText, AlertCircle, TrendingUp, Lightbulb
} from "lucide-react";

interface AiReport {
  id: string;
  title: string;
  date: string;
  period: string;
  conclusion: string;
  statusType: string;
  weightDelta?: number | null;
  muscleDelta?: number | null;
  waistDelta?: number | null;
  strengthDelta?: number | null;
}

interface ReportsScreenProps {
  report?: AiReport;
  aiAnalysis?: {
    title: string;
    conclusion: string;
    statusType: string;
    statusTitle: string;
    statusColor: string;
    alerts: string[];
    predictions: {
      days15Weight: number;
      days30Weight: number;
      days30Waist: number;
      projectionText: string;
    };
    recommendations: string[];
  };
}

function formatStatusType(statusType: string): { title: string; color: string } {
  switch (statusType) {
    case "MUSCLE_GAIN": return { title: "Ganancia Muscular", color: "#0066ff" };
    case "FAT_LOSS": return { title: "Pérdida de Grasa", color: "#22c55e" };
    case "MUSCLE_LOSS_WARNING": return { title: "⚠️ Alerta: Posible Pérdida Muscular", color: "#f43f5e" };
    default: return { title: "Recomposición Positiva", color: "#22c55e" };
  }
}

function formatDelta(val: number | null | undefined, unit: string, invert = false): { deltaText: string; positive: boolean | null } {
  if (val == null) return { deltaText: "–", positive: null };
  if (val === 0) return { deltaText: "sin cambios", positive: null };
  const positive = invert ? val < 0 : val > 0;
  return { deltaText: `${val > 0 ? "+" : ""}${val} ${unit}`, positive };
}

export function ReportsScreen({ report, aiAnalysis }: ReportsScreenProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (!report) return;
    const text = `${report.title}: ${report.conclusion}`;
    if (navigator.share) {
      navigator.share({ title: report.title, text }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (!report) {
    return (
      <div className="space-y-6 pb-24 max-w-lg mx-auto animate-fadeIn">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="rounded-full p-2 bg-white/5 text-[#94a3b8] hover:text-white transition">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-xl font-bold text-white">Reportes IA</h1>
          <div className="w-9" />
        </div>
        <div className="rounded-3xl border border-white/[0.08] bg-[#131926]/70 p-8 text-center space-y-4">
          <FileText className="h-10 w-10 text-[#64748b] mx-auto opacity-50" />
          <h3 className="font-bold text-white">Sin datos para generar reporte</h3>
          <p className="text-sm text-[#64748b] leading-relaxed">
            Los reportes se calculan automáticamente en el momento en que tu entrenador o tú registran las primeras medidas corporales.
          </p>
          <Link href="/dashboard/measurements" className="inline-block mt-2 rounded-xl bg-[#0066ff]/20 border border-[#0066ff]/30 px-4 py-2 text-xs font-bold text-[#0066ff] hover:bg-[#0066ff]/30 transition">
            Ir a registrar medidas →
          </Link>
        </div>
      </div>
    );
  }

  const status = formatStatusType(report.statusType);
  const periodLabels: Record<string, string> = { "15D": "15 días", "30D": "30 días", "60D": "60 días", "MONTHLY": "Mensual" };
  const periodLabel = periodLabels[report.period] ?? report.period;

  const deltas = [
    { icon: Scale, title: "Peso", ...formatDelta(report.weightDelta, "kg") },
    { icon: Dumbbell, title: "Músculo Magro", ...formatDelta(report.muscleDelta, "kg") },
    { icon: Sparkles, title: "Cintura", ...formatDelta(report.waistDelta, "cm", true) },
    { icon: Zap, title: "Fuerza PRs", ...formatDelta(report.strengthDelta, "%") },
  ];

  return (
    <div className="space-y-6 pb-24 max-w-lg mx-auto animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="rounded-full p-2 bg-white/5 text-[#94a3b8] hover:text-white transition">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-bold text-white">Reporte Inteligente</h1>
        <div className="w-9" />
      </div>

      {/* Report Header Card */}
      <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#131926]/90 to-[#070a10]/95 p-6 backdrop-blur-2xl shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00d2ff]">Ecosistema Central</span>
            <h2 className="font-display text-lg font-bold text-white mt-0.5">{report.title}</h2>
            <p className="text-xs text-[#94a3b8] mt-0.5">
              {new Date(report.date).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <span className="rounded-full px-3 py-1 text-[10px] font-black border border-white/10 bg-white/5 text-[#94a3b8]">
            {periodLabel}
          </span>
        </div>

        <div className="h-px bg-white/[0.06]" />

        {/* Deltas Grid */}
        <div className="grid grid-cols-2 gap-3">
          {deltas.map(d => (
            <div key={d.title} className="rounded-2xl border border-white/[0.08] bg-[#080d16]/80 p-3.5 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-1">
                <d.icon className="h-4 w-4 text-[#94a3b8]" />
                <span className="text-[10px] font-bold uppercase text-[#94a3b8]">{d.title}</span>
              </div>
              <span className={`font-display text-lg font-black ${
                d.positive === null ? "text-[#64748b]"
                : d.positive ? "text-[#22c55e]"
                : "text-[#f43f5e]"
              }`}>
                {d.deltaText}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Conclusion Card */}
      <div className="rounded-3xl border border-[#22c55e]/40 bg-gradient-to-b from-[#132c20]/90 to-[#0c1a13]/90 p-5 backdrop-blur-2xl shadow-[0_15px_40px_rgba(34,197,94,0.2)] space-y-2.5">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" style={{ color: status.color }} />
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: status.color }}>
            {status.title}
          </span>
        </div>
        <p className="text-sm text-[#cbd5e1] leading-relaxed font-medium">
          {report.conclusion}
        </p>
      </div>

      {/* Alertas Detectadas por la IA */}
      {aiAnalysis && aiAnalysis.alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] px-1 flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-amber-400" />
            Alertas del Sistema
          </h3>
          {aiAnalysis.alerts.map((al, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>{al}</span>
            </div>
          ))}
        </div>
      )}

      {/* Predicciones IA */}
      {aiAnalysis?.predictions && (
        <div className="rounded-3xl border border-white/[0.08] bg-[#131926]/70 p-5 backdrop-blur-xl shadow-xl space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#00d2ff] flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-[#00d2ff]" />
            Predicción a 30 Días
          </h3>
          <p className="text-xs text-[#cbd5e1] leading-relaxed">
            {aiAnalysis.predictions.projectionText}
          </p>
        </div>
      )}

      {/* Recomendaciones IA */}
      {aiAnalysis?.recommendations && aiAnalysis.recommendations.length > 0 && (
        <div className="rounded-3xl border border-white/[0.08] bg-[#131926]/70 p-5 backdrop-blur-xl shadow-xl space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Lightbulb className="h-4 w-4 text-emerald-400" />
            Recomendaciones Personalizadas
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {aiAnalysis.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#00d2ff] font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleShare}
        className="w-full rounded-2xl bg-gradient-to-r from-[#0066ff] to-[#0084ff] py-4 text-sm font-bold text-white shadow-[0_0_25px_rgba(0,102,255,0.7)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
      >
        <Share2 className="h-4 w-4" />
        {copied ? "¡Copiado al portapapeles!" : "Compartir reporte"}
      </button>
    </div>
  );
}
