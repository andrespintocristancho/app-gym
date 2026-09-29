"use client";

import { useSession } from "next-auth/react";
import { Bell, Search, User } from "lucide-react";

export function Topbar() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-white/[0.07] bg-[#0f131c]/85 px-5 backdrop-blur-xl sm:px-8">
      <div className="flex-1 flex items-center">
        <div className="relative hidden w-64 md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#6f786d]" />
          </div>
          <input
            type="text"
            className="block w-full rounded-full border border-white/[0.08] bg-[#1c2028] py-2 pl-10 pr-3 text-sm text-white placeholder-[#6f786d] transition-colors focus:border-[#c3f400]/50 focus:outline-none focus:ring-1 focus:ring-[#c3f400]/40"
            placeholder="Buscar clientes..."
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-[#aab1a1] transition-colors hover:text-white">
          <Bell className="w-5 h-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border border-[#0f131c] bg-[#c3f400]"></span>
        </button>
        
        <div className="flex items-center border-l border-white/[0.08] pl-4">
          <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#c3f400]/10"><User className="h-4 w-4 text-[#c3f400]" />
          </div>
          <div className="flex flex-col">
            <span className="mb-1 text-sm font-medium leading-none text-white">
              {session?.user?.name || "Jefferson Cobos"}
            </span>
            <span className="text-xs leading-none text-[#aab1a1]">
              Entrenador e instructor
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
