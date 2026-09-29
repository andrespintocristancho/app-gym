"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Scale, TrendingUp, GitCompare, Camera, 
  PieChart, Dumbbell, Timer, Utensils, BarChart3, FileText, 
  Target, Settings, LogOut, Users, CreditCard, ClipboardCheck, 
  Sparkles, ShieldCheck 
} from "lucide-react";
import { signOut } from "next-auth/react";

interface SidebarProps {
  role?: string;
}

export function Sidebar({ role = "CLIENT" }: SidebarProps) {
  const pathname = usePathname();

  const clientNav = [
    { name: "Inicio", href: "/dashboard", icon: LayoutDashboard },
    { name: "Medidas Corporales", href: "/dashboard/measurements", icon: Scale },
    { name: "Evolución y Gráficas", href: "/dashboard/evolution", icon: TrendingUp },
    { name: "Comparación Inteligente", href: "/dashboard/compare", icon: GitCompare },
    { name: "Fotos de Progreso", href: "/dashboard/photos", icon: Camera },
    { name: "Composición Corporal", href: "/dashboard/composition", icon: PieChart },
    { name: "Entrenamiento", href: "/dashboard/workouts", icon: Dumbbell },
    { name: "Temporizador", href: "/dashboard/timer", icon: Timer },
    { name: "Nutrición", href: "/dashboard/nutrition", icon: Utensils },
    { name: "Estadísticas Avanzadas", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Reportes Inteligentes", href: "/dashboard/reports", icon: FileText },
    { name: "Análisis Central IA", href: "/dashboard/ai", icon: Sparkles },
    { name: "Objetivos", href: "/dashboard/goals", icon: Target },
    { name: "Configuración", href: "/dashboard/settings", icon: Settings },
  ];

  const trainerExtra = [
    { name: "Directorio de Atletas", href: "/dashboard/clients", icon: Users },
    { name: "Control de Pagos", href: "/dashboard/payments", icon: CreditCard },
    { name: "Control Asistencia", href: "/dashboard/attendance", icon: ClipboardCheck },
  ];

  const items = role === "TRAINER" ? [...clientNav, ...trainerExtra] : clientNav;

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/[0.08] bg-[#070a10] md:flex">
      {/* Brand Header */}
      <div className="flex flex-col justify-center border-b border-white/[0.08] px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0066ff] to-[#00d2ff] p-0.5 shadow-[0_0_20px_rgba(0,102,255,0.6)]">
            <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#080d16]">
              <Sparkles className="h-5 w-5 text-[#00d2ff]" />
            </div>
          </div>
          <div>
            <span className="font-display block text-lg font-black tracking-wider text-white">FITPRO</span>
            <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#00d2ff]">
              EVOLUTION GYM
            </span>
          </div>
        </div>
        <p className="mt-2 text-[9px] font-bold uppercase tracking-widest text-[#64748b]">
          DISCIPLINA HOY, RESULTADOS MAÑANA
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 custom-scrollbar">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                isActive 
                  ? "bg-[#0066ff] text-white shadow-[0_0_15px_rgba(0,102,255,0.6)]" 
                  : "text-[#94a3b8] hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <item.icon className={`mr-3 h-4 w-4 ${isActive ? "text-white" : "text-[#64748b] group-hover:text-[#00d2ff]"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Quote & Logout */}
      <div className="space-y-3 border-t border-white/[0.08] p-4 bg-[#080d16]">
        <div className="rounded-xl bg-[#131926]/50 p-2.5 border border-white/5 text-center">
          <p className="text-[10px] text-[#94a3b8] italic">
            &ldquo;La mejor versión de ti, está en proceso.&rdquo;
          </p>
        </div>

        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center rounded-xl px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition"
        >
          <LogOut className="mr-3 h-4 w-4 text-rose-400" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
