"use client";
import { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Flag } from "lucide-react";

type Mode = "stopwatch" | "timer" | "hiit";

function fmt(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}.${String(cs).padStart(2,"0")}`;
}
function fmtS(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

export default function TimerApp() {
  const [mode, setMode] = useState<Mode>("stopwatch");
  // Stopwatch
  const [swRunning, setSwRunning] = useState(false);
  const [swMs, setSwMs] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const swRef = useRef<NodeJS.Timeout | null>(null);
  const swStart = useRef(0);
  const swAccum = useRef(0);
  // Timer
  const [tmMin, setTmMin] = useState(1);
  const [tmSec, setTmSec] = useState(0);
  const [tmRemaining, setTmRemaining] = useState(60);
  const [tmTotal, setTmTotal] = useState(60);
  const [tmRunning, setTmRunning] = useState(false);
  const tmRef = useRef<NodeJS.Timeout | null>(null);
  // HIIT
  const [hiitWork, setHiitWork] = useState(30);
  const [hiitRest, setHiitRest] = useState(15);
  const [hiitRounds, setHiitRounds] = useState(8);
  const [hiitRound, setHiitRound] = useState(1);
  const [hiitPhase, setHiitPhase] = useState<"work" | "rest">("work");
  const [hiitRemaining, setHiitRemaining] = useState(30);
  const [hiitRunning, setHiitRunning] = useState(false);
  const hiitRef = useRef<NodeJS.Timeout | null>(null);

  // Stopwatch logic
  useEffect(() => {
    if (swRunning) {
      swStart.current = Date.now();
      swRef.current = setInterval(() => {
        setSwMs(swAccum.current + Date.now() - swStart.current);
      }, 33);
    } else {
      if (swRef.current) clearInterval(swRef.current);
      swAccum.current = swMs;
    }
    return () => { if (swRef.current) clearInterval(swRef.current); };
  }, [swRunning]);

  const swReset = () => { setSwRunning(false); setSwMs(0); setLaps([]); swAccum.current = 0; };
  const swLap = () => setLaps(l => [...l, swMs]);

  // Timer logic
  const startTimer = () => {
    const total = tmMin * 60 + tmSec;
    setTmTotal(total); setTmRemaining(total); setTmRunning(true);
  };
  useEffect(() => {
    if (tmRunning) {
      tmRef.current = setInterval(() => {
        setTmRemaining(r => { if (r <= 1) { clearInterval(tmRef.current!); setTmRunning(false); return 0; } return r - 1; });
      }, 1000);
    } else { if (tmRef.current) clearInterval(tmRef.current); }
    return () => { if (tmRef.current) clearInterval(tmRef.current); };
  }, [tmRunning]);

  const tmReset = () => { setTmRunning(false); setTmRemaining(tmMin * 60 + tmSec); };
  const tmPct = tmTotal > 0 ? tmRemaining / tmTotal : 1;
  const r = 90;
  const circumference = 2 * Math.PI * r;
  const timerColor = tmPct > 0.5 ? "#c3f400" : tmPct > 0.25 ? "#f59e0b" : "#ff6b6b";

  // HIIT logic
  useEffect(() => {
    if (hiitRunning) {
      hiitRef.current = setInterval(() => {
        setHiitRemaining(r => {
          if (r <= 1) {
            setHiitPhase(p => {
              if (p === "work") { setHiitRemaining(hiitRest); return "rest"; }
              else {
                setHiitRound(ro => {
                  if (ro >= hiitRounds) { setHiitRunning(false); return ro; }
                  setHiitRemaining(hiitWork); return ro + 1;
                });
                return "work";
              }
            });
            return r;
          }
          return r - 1;
        });
      }, 1000);
    } else { if (hiitRef.current) clearInterval(hiitRef.current); }
    return () => { if (hiitRef.current) clearInterval(hiitRef.current); };
  }, [hiitRunning, hiitWork, hiitRest, hiitRounds]);

  const hiitReset = () => { setHiitRunning(false); setHiitRound(1); setHiitPhase("work"); setHiitRemaining(hiitWork); };

  const tabBtn = (t: Mode, label: string) => (
    <button onClick={() => setMode(t)}
      className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${mode === t ? "bg-[#c3f400] text-[#161e00]" : "text-[#aab1a1] hover:text-white"}`}>
      {label}
    </button>
  );

  return (
    <div className="space-y-6 pb-8">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#c3f400]">Módulo de tiempo</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-white">Cronómetro</h1>
      </div>
      <div className="flex gap-1 rounded-xl bg-[#1c2028] p-1 w-fit">
        {tabBtn("stopwatch","Cronómetro")} {tabBtn("timer","Temporizador")} {tabBtn("hiit","HIIT")}
      </div>

      {/* STOPWATCH */}
      {mode === "stopwatch" && (
        <div className="rounded-2xl bg-[#1c2028] border border-white/[0.07] p-6 flex flex-col items-center gap-6">
          <p className="font-mono text-7xl font-bold text-white tracking-tight">{fmt(swMs)}</p>
          <div className="flex gap-3">
            <button onClick={() => setSwRunning(r => !r)}
              className={`flex items-center gap-2 rounded-full px-6 py-3 font-bold text-sm transition-all ${swRunning ? "bg-[#ff6b6b] text-white" : "bg-[#c3f400] text-[#161e00]"}`}>
              {swRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {swRunning ? "Pausar" : "Iniciar"}
            </button>
            <button onClick={swLap} disabled={!swRunning}
              className="flex items-center gap-2 rounded-full px-5 py-3 font-bold text-sm bg-white/10 text-white disabled:opacity-40 transition-all hover:bg-white/20">
              <Flag className="h-4 w-4" /> Vuelta
            </button>
            <button onClick={swReset}
              className="flex items-center gap-2 rounded-full px-5 py-3 font-bold text-sm bg-white/10 text-white hover:bg-white/20 transition-all">
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          </div>
          {laps.length > 0 && (
            <div className="w-full max-h-40 overflow-y-auto rounded-xl bg-[#0a0e16] p-3 space-y-1">
              {[...laps].reverse().map((l, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-[#aab1a1]">Vuelta {laps.length - i}</span>
                  <span className="font-mono text-white">{fmt(l)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TIMER */}
      {mode === "timer" && (
        <div className="rounded-2xl bg-[#1c2028] border border-white/[0.07] p-6 flex flex-col items-center gap-6">
          {!tmRunning && tmRemaining === (tmMin*60+tmSec) && (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <label className="text-xs text-[#aab1a1] mb-1">Min</label>
                <input type="number" min={0} max={99} value={tmMin}
                  onChange={e => { setTmMin(+e.target.value); setTmRemaining(+e.target.value*60+tmSec); setTmTotal(+e.target.value*60+tmSec); }}
                  className="w-20 text-center text-2xl font-bold bg-[#0a0e16] border border-white/10 rounded-xl py-2 text-white focus:border-[#c3f400] focus:outline-none" />
              </div>
              <span className="text-3xl font-bold text-[#aab1a1] mt-4">:</span>
              <div className="flex flex-col items-center">
                <label className="text-xs text-[#aab1a1] mb-1">Seg</label>
                <input type="number" min={0} max={59} value={tmSec}
                  onChange={e => { setTmSec(+e.target.value); setTmRemaining(tmMin*60+ +e.target.value); setTmTotal(tmMin*60+ +e.target.value); }}
                  className="w-20 text-center text-2xl font-bold bg-[#0a0e16] border border-white/10 rounded-xl py-2 text-white focus:border-[#c3f400] focus:outline-none" />
              </div>
            </div>
          )}
          <div className="relative">
            <svg width="220" height="220" viewBox="0 0 220 220">
              <circle cx="110" cy="110" r={r} fill="none" stroke="#262a33" strokeWidth="12" />
              <circle cx="110" cy="110" r={r} fill="none" stroke={timerColor}
                strokeWidth="12" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - tmPct)}
                transform="rotate(-90 110 110)"
                style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-5xl font-bold text-white">{fmtS(tmRemaining)}</span>
              <span className="text-xs text-[#aab1a1] mt-1">Descanso</span>
            </div>
          </div>
          <div className="flex gap-3">
            {!tmRunning ? (
              <button onClick={startTimer} className="flex items-center gap-2 rounded-full px-6 py-3 font-bold text-sm bg-[#c3f400] text-[#161e00]">
                <Play className="h-4 w-4" /> Iniciar
              </button>
            ) : (
              <button onClick={() => setTmRunning(false)} className="flex items-center gap-2 rounded-full px-6 py-3 font-bold text-sm bg-[#f59e0b] text-[#161e00]">
                <Pause className="h-4 w-4" /> Pausar
              </button>
            )}
            <button onClick={tmReset} className="flex items-center gap-2 rounded-full px-5 py-3 font-bold text-sm bg-white/10 text-white hover:bg-white/20">
              <RotateCcw className="h-4 w-4" /> Reiniciar
            </button>
          </div>
        </div>
      )}

      {/* HIIT */}
      {mode === "hiit" && (
        <div className="rounded-2xl bg-[#1c2028] border border-white/[0.07] p-6 space-y-5">
          {!hiitRunning && (
            <div className="grid grid-cols-3 gap-3">
              {[["Trabajo (s)", hiitWork, setHiitWork], ["Descanso (s)", hiitRest, setHiitRest], ["Rondas", hiitRounds, setHiitRounds]].map(([l, v, s]: any) => (
                <div key={l} className="flex flex-col items-center">
                  <label className="text-xs text-[#aab1a1] mb-1">{l}</label>
                  <input type="number" min={1} value={v} onChange={e => s(+e.target.value)}
                    className="w-full text-center text-xl font-bold bg-[#0a0e16] border border-white/10 rounded-xl py-2 text-white focus:border-[#c3f400] focus:outline-none" />
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-col items-center gap-4">
            <div className={`w-full rounded-xl p-3 text-center font-bold text-lg ${hiitPhase === "work" ? "bg-[#c3f400]/20 text-[#c3f400]" : "bg-blue-500/20 text-blue-400"}`}>
              {hiitPhase === "work" ? "⚡ TRABAJO" : "💤 DESCANSO"}
            </div>
            <p className="font-mono text-7xl font-bold text-white">{fmtS(hiitRemaining)}</p>
            <p className="text-[#aab1a1] text-sm">Ronda <span className="text-white font-bold">{hiitRound}</span> de <span className="text-white font-bold">{hiitRounds}</span></p>
            <div className="w-full h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[#c3f400] transition-all"
                style={{ width: `${((hiitRound - 1) / hiitRounds) * 100}%` }} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setHiitRunning(r => !r)}
                className={`flex items-center gap-2 rounded-full px-6 py-3 font-bold text-sm transition-all ${hiitRunning ? "bg-[#f59e0b] text-[#161e00]" : "bg-[#c3f400] text-[#161e00]"}`}>
                {hiitRunning ? <><Pause className="h-4 w-4" /> Pausar</> : <><Play className="h-4 w-4" /> Iniciar</>}
              </button>
              <button onClick={hiitReset} className="flex items-center gap-2 rounded-full px-5 py-3 font-bold text-sm bg-white/10 text-white hover:bg-white/20">
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
