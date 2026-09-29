"use client";

import { useState } from "react";
import { markAttendance } from "@/actions/attendanceActions";
import { CheckCircle, ClipboardCheck } from "lucide-react";

export function MarkAttendanceButton({ clientId }: { clientId: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleMark = async () => {
    setLoading(true);
    setError("");
    const result = await markAttendance(clientId);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || "Error");
    }
    setLoading(false);
  };

  if (success) {
    return (
      <button disabled className="w-full mt-4 flex items-center justify-center gap-2 rounded-lg bg-[#4edea3]/20 p-4 text-sm font-bold text-[#4edea3]">
        <CheckCircle className="h-5 w-5" />
        Asistencia registrada hoy
      </button>
    );
  }

  return (
    <div className="mt-4">
      <button 
        onClick={handleMark} 
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#c3f400] hover:bg-[#c3f400]/80 p-4 text-sm font-bold text-[#161e00] transition-colors disabled:opacity-50"
      >
        <ClipboardCheck className="h-5 w-5" />
        {loading ? "Registrando..." : "Marcar mi asistencia de hoy"}
      </button>
      {error && <p className="mt-2 text-center text-xs text-rose-400">{error}</p>}
    </div>
  );
}
