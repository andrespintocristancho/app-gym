"use client";

import Link from "next/link";
import { 
  ChevronLeft, User, Bell, Ruler, Moon, Shield, 
  RotateCw, HelpCircle, LogOut, ChevronRight 
} from "lucide-react";
import { signOut } from "next-auth/react";

interface SettingsScreenProps {
  user?: {
    name: string;
    email: string;
  };
}

export function SettingsScreen({
  user = { name: "Andrés Pinto", email: "andres@fitnessapp.com" }
}: SettingsScreenProps) {
  const menuItems = [
    { icon: User, label: "Perfil", detail: "" },
    { icon: Bell, label: "Notificaciones", detail: "" },
    { icon: Ruler, label: "Unidades", detail: "kg, cm" },
    { icon: Moon, label: "Tema", detail: "Oscuro" },
    { icon: Shield, label: "Privacidad", detail: "" },
    { icon: RotateCw, label: "Sincronizar datos", detail: "" },
    { icon: HelpCircle, label: "Ayuda y soporte", detail: "" },
  ];

  return (
    <div className="space-y-6 pb-24 max-w-lg mx-auto animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="rounded-full p-2 bg-white/5 text-[#94a3b8] hover:text-white transition">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-bold text-white">Configuración</h1>
        <div className="w-9" />
      </div>

      {/* Profile Header Card */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#131926]/70 p-5 backdrop-blur-xl flex items-center gap-4 shadow-lg">
        <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-[#0066ff] to-[#00d2ff] p-[2px] shadow-[0_0_15px_rgba(0,102,255,0.5)]">
          <div className="h-full w-full rounded-full bg-[#080d16] flex items-center justify-center overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
              alt={user.name}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-white">{user.name}</h3>
          <p className="text-xs text-[#94a3b8]">{user.email}</p>
          <span className="mt-1 inline-block px-2.5 py-0.5 rounded-full bg-[#0066ff]/20 text-[#00d2ff] text-[10px] font-bold">
            Miembro Premium
          </span>
        </div>
      </div>

      {/* Settings Menu List */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#131926]/70 overflow-hidden backdrop-blur-xl shadow-xl divide-y divide-white/[0.06]">
        {menuItems.map(item => (
          <div
            key={item.label}
            className="flex items-center justify-between p-4 hover:bg-white/[0.02] cursor-pointer transition"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center text-[#00d2ff]">
                <item.icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-white">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.detail && <span className="text-xs text-[#94a3b8]">{item.detail}</span>}
              <ChevronRight className="h-4 w-4 text-[#64748b]" />
            </div>
          </div>
        ))}
      </div>

      {/* Cerrar Sesión Button */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full rounded-2xl border border-rose-500/20 bg-rose-500/10 py-4 text-xs font-bold text-rose-400 hover:bg-rose-500/20 active:scale-[0.99] transition flex items-center justify-center gap-2"
      >
        <LogOut className="h-4 w-4" /> Cerrar sesión
      </button>
    </div>
  );
}
