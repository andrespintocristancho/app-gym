import type { Measurement } from "@prisma/client";

/** % grasa US Navy con fallback antropométrico confiable */
export function estimateBodyFat(m: Partial<Measurement>): number | null {
  const h = m.height;
  const w = m.waist;
  const n = m.neck;
  const hip = m.hip;
  const sex = (m.sex || "MALE").toUpperCase();

  // 1. Método US Navy si están los datos requeridos
  if (h && w && n) {
    if (sex === "FEMALE" && hip) {
      const diff = w + hip - n;
      if (diff > 0 && h > 0) {
        const val = 163.205 * Math.log10(diff) - 97.684 * Math.log10(h) - 78.387;
        return +Math.max(6, Math.min(55, val)).toFixed(1);
      }
    }
    const diff = w - n;
    if (diff > 0 && h > 0) {
      const val = 86.010 * Math.log10(diff) - 70.041 * Math.log10(h) + 36.76;
      return +Math.max(4, Math.min(50, val)).toFixed(1);
    }
  }

  // 2. Fallback antropométrico basado en cintura y altura (WHtR)
  if (h && w && h > 0) {
    const whtr = w / h;
    let estFat = sex === "FEMALE" 
      ? 64 * whtr - 12
      : 55 * whtr - 11;
    return +Math.max(5, Math.min(50, estFat)).toFixed(1);
  }

  // 3. Fallback basado en IMC y edad (Deurenberg)
  if (m.weight && h && h > 0) {
    const bmi = m.weight / Math.pow(h / 100, 2);
    const age = m.age || 25;
    const genderFactor = sex === "FEMALE" ? 0 : 1;
    const val = 1.20 * bmi + 0.23 * age - 10.8 * genderFactor - 5.4;
    return +Math.max(5, Math.min(50, val)).toFixed(1);
  }

  return null;
}

/** Masa magra en kg */
export function calcLeanMass(weight: number, bodyFatPct: number): number {
  return +(weight * (1 - bodyFatPct / 100)).toFixed(2);
}

/** BMR Mifflin-St Jeor */
export function calcBMR(m: Partial<Measurement>): number | null {
  if (!m.weight || !m.height) return null;
  const age = m.age || 25;
  const s = (m.sex || "MALE").toUpperCase() === "FEMALE" ? -161 : 5;
  return +(10 * m.weight + 6.25 * m.height - 5 * age + s).toFixed(0);
}

/** IMC */
export function calcBMI(weight: number, heightCm: number): number {
  return +(weight / Math.pow(heightCm / 100, 2)).toFixed(1);
}

/** Peso ideal Broca */
export function calcIdealWeight(heightCm: number, sex?: string | null): number {
  const base = heightCm - 100;
  return +(sex?.toUpperCase() === "FEMALE" ? base * 0.85 : base * 0.9).toFixed(1);
}

/** IMC label */
export function bmiLabel(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Bajo peso", color: "#3b82f6" };
  if (bmi < 25) return { label: "Normal", color: "#4edea3" };
  if (bmi < 30) return { label: "Sobrepeso", color: "#f59e0b" };
  return { label: "Obesidad", color: "#ff6b6b" };
}

/** Análisis de tendencia comparando dos medidas */
export function analyseProgress(current: Partial<Measurement>, previous: Partial<Measurement>) {
  const Δw = (current.weight ?? 0) - (previous.weight ?? 0);
  const Δwaist = (current.waist ?? 0) - (previous.waist ?? 0);
  const Δarm = (current.rightArm ?? 0) - (previous.rightArm ?? 0);
  const Δchest = (current.chest ?? 0) - (previous.chest ?? 0);
  const Δthigh = (current.rightThigh ?? 0) - (previous.rightThigh ?? 0);

  if (Δw > 0.3 && Δarm > 0.2 && Δchest >= 0 && Δwaist <= 0)
    return { label: "Ganancia muscular positiva", icon: "💪", color: "#4edea3", bg: "bg-emerald-500/10 border-emerald-500/30" };
  if (Math.abs(Δw) <= 1.5 && (Δarm > 0.2 || (current.leanMass ?? 0) > (previous.leanMass ?? 0)) && Δwaist < -0.5)
    return { label: "Recomposición corporal positiva", icon: "🔄", color: "#c3f400", bg: "bg-lime-500/10 border-lime-500/30" };
  if (Δw < -0.3 && Δwaist < -0.5 && Δarm >= -0.5)
    return { label: "Pérdida de grasa exitosa", icon: "🔥", color: "#3b82f6", bg: "bg-blue-500/10 border-blue-500/30" };
  if (Δw < -0.5 && Δarm < -0.4 && Δthigh < -0.4)
    return { label: "⚠️ Posible pérdida muscular", icon: "⚠️", color: "#ff6b6b", bg: "bg-red-500/10 border-red-500/30" };
  if (Δw > 0.5 && Δwaist > 0.5 && Δarm <= 0)
    return { label: "Posible ganancia de grasa", icon: "📊", color: "#f59e0b", bg: "bg-amber-500/10 border-amber-500/30" };
  return { label: "Estable — sin cambio significativo", icon: "➡️", color: "#aab1a1", bg: "bg-white/5 border-white/10" };
}

/** Calcular todos los campos derivados de una medición */
export function computeDerivedFields(m: Partial<Measurement>) {
  const bmi = m.weight && m.height ? calcBMI(m.weight, m.height) : null;
  const bodyFat = estimateBodyFat(m);
  const leanMass = bodyFat !== null && m.weight ? calcLeanMass(m.weight, bodyFat) : null;
  const bmr = calcBMR(m);
  const idealWeight = m.height ? calcIdealWeight(m.height, m.sex) : null;
  return { bmi, bodyFat, leanMass, bmr, idealWeight };
}
