"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function ProgressChart({ measurements }: { measurements: any[] }) {
  if (!measurements || measurements.length === 0) return null;

  return (
    <div className="bg-[#1c2028] p-5 rounded-xl border border-white/[0.07] mt-6">
      <h3 className="text-white font-semibold mb-4">📈 Evolución del Peso Global</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={[...measurements].reverse()} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => format(new Date(date), "dd MMM", { locale: es })}
              stroke="#94a3b8" 
              fontSize={12}
            />
            <YAxis 
              domain={['dataMin - 2', 'dataMax + 2']} 
              stroke="#94a3b8" 
              fontSize={12}
              tickFormatter={(val) => `${val}kg`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
              labelFormatter={(date) => format(new Date(date as string), "dd MMM yyyy", { locale: es })}
              formatter={(value) => [`${value} kg`, 'Peso']}
            />
            <Line 
              type="monotone" 
              dataKey="weight" 
              stroke="#c3f400" 
              strokeWidth={3}
              dot={{ fill: '#c3f400', r: 4 }}
              activeDot={{ r: 6, fill: '#e6ff00' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
