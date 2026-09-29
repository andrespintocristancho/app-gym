import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, TrendingUp, Dumbbell, Timer, Target, 
  Utensils, Menu, Sparkles, Scale, Camera, MoreHorizontal
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = session.user.role;
  const name = session.user.name ?? "U";
  const initial = name.charAt(0).toUpperCase();

  // Mobile Bottom Nav items (Exact matching reference image)
  const mobileNav = [
    { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
    { href: "/dashboard/evolution", label: "Progreso", icon: TrendingUp },
    { href: "/dashboard/workouts", label: "Entrena", icon: Dumbbell },
    { href: "/dashboard/nutrition", label: "Nutrición", icon: Utensils },
    { href: "/dashboard/measurements", label: "Medidas", icon: Scale },
  ];

  return (
    <div className="flex min-h-screen bg-[#070a10] text-white selection:bg-[#0066ff] selection:text-white">
      {/* Desktop Sidebar (Screen 15) */}
      <Sidebar role={role} />

      {/* Main Container */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-50 border-b border-white/[0.08] bg-[#070a10]/95 backdrop-blur-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0066ff] to-[#00d2ff] p-0.5 shadow-[0_0_15px_rgba(0,102,255,0.6)]">
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#080d16]">
                <Sparkles className="h-4 w-4 text-[#00d2ff]" />
              </div>
            </div>
            <span className="font-display text-sm font-black tracking-wider text-white">FITPRO</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/settings" className="flex items-center gap-2">
              <span className="rounded-full bg-[#0066ff]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#00d2ff]">PRO</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-[#0066ff] to-[#00d2ff] font-bold text-xs text-white">
                {initial}
              </div>
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 px-4 py-6 md:px-8 pb-28 md:pb-8 overflow-y-auto">
          <div className="mx-auto max-w-4xl">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar (Exact reference image style) */}
        <nav className="md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-[#070a10]/95 backdrop-blur-2xl">
          <div className="grid h-16 grid-cols-5 max-w-md mx-auto">
            {mobileNav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-[#94a3b8] transition-colors hover:text-[#00d2ff]"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
