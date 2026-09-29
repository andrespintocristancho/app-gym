"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ChevronLeft, Play, Pause, RotateCcw, Volume2, 
  VolumeX, Dumbbell, Sparkles, Clock, Flame 
} from "lucide-react";

export function TimerScreen() {
  const [tab, setTab] = useState<"cronometro" | "temporizador" | "hiit">("temporizador");
  const [totalSeconds, setTotalSeconds] = useState(45);
  const [initialSeconds, setInitialSeconds] = useState(45);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Web Audio Synth Beep
  const playBeep = (freq = 800, duration = 0.15) => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (isRunning && totalSeconds > 0) {
      interval = setInterval(() => {
        setTotalSeconds(s => {
          if (s <= 4 && s > 1) playBeep(600, 0.1);
          if (s === 1) playBeep(1200, 0.4);
          return s - 1;
        });
      }, 1000);
    } else if (totalSeconds === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, totalSeconds, soundEnabled]);

  const toggleRun = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setTotalSeconds(initialSeconds);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const progressPct = initialSeconds > 0 ? (totalSeconds / initialSeconds) : 1;

  return (
    <div className="space-y-6 pb-24 max-w-lg mx-auto animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="rounded-full p-2 bg-white/5 text-[#94a3b8] hover:text-white transition">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-xl font-bold text-white">Temporizador</h1>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="rounded-full p-2 bg-white/5 text-[#94a3b8] hover:text-white transition"
        >
          {soundEnabled ? <Volume2 className="h-5 w-5 text-[#00d2ff]" /> : <VolumeX className="h-5 w-5" />}
        </button>
      </div>

      {/* Tabs: [Cronómetro] [Temporizador] [HIIT] */}
      <div className="flex rounded-2xl bg-[#131926]/80 p-1 border border-white/[0.08] backdrop-blur-xl">
        <button
          onClick={() => { setTab("cronometro"); setInitialSeconds(60); setTotalSeconds(60); setIsRunning(false); }}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
            tab === "cronometro"
              ? "bg-[#0066ff] text-white shadow-[0_0_15px_rgba(0,102,255,0.6)]"
              : "text-[#94a3b8] hover:text-white"
          }`}
        >
          Cronómetro
        </button>
        <button
          onClick={() => { setTab("temporizador"); setInitialSeconds(45); setTotalSeconds(45); setIsRunning(false); }}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
            tab === "temporizador"
              ? "bg-[#0066ff] text-white shadow-[0_0_15px_rgba(0,102,255,0.6)]"
              : "text-[#94a3b8] hover:text-white"
          }`}
        >
          Temporizador
        </button>
        <button
          onClick={() => { setTab("hiit"); setInitialSeconds(30); setTotalSeconds(30); setIsRunning(false); }}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
            tab === "hiit"
              ? "bg-[#0066ff] text-white shadow-[0_0_15px_rgba(0,102,255,0.6)]"
              : "text-[#94a3b8] hover:text-white"
          }`}
        >
          HIIT
        </button>
      </div>

      {/* Giant Glowing Neon Circular Timer Ring */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#131926]/90 via-[#0d131f]/90 to-[#070a10]/95 p-8 backdrop-blur-2xl shadow-2xl flex flex-col items-center justify-center">
        {/* Glowing Halo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-48 w-48 rounded-full bg-[#22c55e]/15 blur-3xl" />
        </div>

        {/* Circular Countdown Ring */}
        <div className="relative flex items-center justify-center my-4">
          <svg className="w-60 h-60 transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="120"
              cy="120"
              r="100"
              stroke="#1a2436"
              strokeWidth="14"
              fill="transparent"
            />
            {/* Active Glowing Ring */}
            <circle
              cx="120"
              cy="120"
              r="100"
              stroke="url(#neonGreenGrad)"
              strokeWidth="14"
              strokeDasharray={2 * Math.PI * 100}
              strokeDashoffset={2 * Math.PI * 100 * (1 - progressPct)}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-300 ease-linear shadow-[0_0_20px_#22c55e]"
            />
            <defs>
              <linearGradient id="neonGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#4edea3" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Digital Display */}
          <div className="absolute text-center flex flex-col items-center justify-center">
            <span className="font-display text-5xl font-black text-white tracking-tight drop-shadow-[0_0_15px_rgba(34,197,94,0.6)]">
              {formatTime(totalSeconds)}
            </span>
            <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mt-1">
              Descanso
            </span>
          </div>
        </div>

        {/* Preset Rest Duration Quick Selector */}
        <div className="flex gap-2 mt-2">
          {[30, 45, 60, 90, 120].map(s => (
            <button
              key={s}
              onClick={() => { setInitialSeconds(s); setTotalSeconds(s); setIsRunning(false); }}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                initialSeconds === s
                  ? "bg-[#22c55e] text-[#070a10] shadow-[0_0_10px_rgba(34,197,94,0.6)]"
                  : "bg-[#080d16] text-[#94a3b8] border border-white/5 hover:text-white"
              }`}
            >
              {s}s
            </button>
          ))}
        </div>
      </div>

      {/* Primary Dual Controls: [Pausar / Iniciar] [Reiniciar] */}
      <div className="grid grid-cols-2 gap-3.5">
        <button
          onClick={toggleRun}
          className={`rounded-2xl py-4 text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
            isRunning
              ? "bg-[#0066ff] shadow-[0_0_25px_rgba(0,102,255,0.7)]"
              : "bg-[#22c55e] text-[#070a10] shadow-[0_0_25px_rgba(34,197,94,0.7)] hover:brightness-110"
          }`}
        >
          {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
          {isRunning ? "Pausar" : "Iniciar"}
        </button>

        <button
          onClick={resetTimer}
          className="rounded-2xl border border-white/10 bg-[#131926]/70 py-4 text-sm font-bold text-white hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reiniciar
        </button>
      </div>

      {/* Siguiente Ejercicio Preview Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#131926]/70 p-4 backdrop-blur-xl flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#0066ff]/10 flex items-center justify-center text-[#00d2ff]">
            <Dumbbell className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8] block">Siguiente ejercicio</span>
            <h4 className="font-bold text-white text-sm">Press Banca</h4>
            <p className="text-xs text-[#94a3b8]">4 x 8 - 90 kg</p>
          </div>
        </div>
      </div>
    </div>
  );
}
