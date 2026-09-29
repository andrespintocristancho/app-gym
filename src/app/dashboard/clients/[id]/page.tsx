import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Activity, Dumbbell, CreditCard, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { ClientProfileTabs } from "./ClientProfileTabs";
import { ClientStatusActions } from "../ClientStatusActions";
import { computeEcosystemData } from "@/lib/centralEngine";

export default async function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const client = await prisma.clientProfile.findUnique({
    where: { id: resolvedParams.id },
    include: { user: true }
  });

  if (!client) {
    notFound();
  }

  const [
    measurements,
    clientRoutines,
    allAvailableRoutines,
    goals,
    nutritionTarget,
    ecosystemData
  ] = await Promise.all([
    prisma.measurement.findMany({
      where: { clientId: client.id },
      orderBy: { date: 'desc' }
    }),
    prisma.routine.findMany({
      where: { clientId: client.id },
      include: {
        exercises: {
          include: { exercise: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.routine.findMany({
      select: { id: true, name: true, clientId: true },
      distinct: ['name']
    }),
    prisma.goal.findMany({
      where: { clientId: client.id },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.nutritionLog.findFirst({
      where: { clientId: client.id, targetCalories: { gt: 0 } },
      orderBy: { date: 'desc' }
    }),
    computeEcosystemData(client.id)
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link href="/dashboard/clients" className="p-2 hover:bg-slate-800 rounded-lg mr-3 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Panel del Instructor</h1>
          <p className="text-slate-400 text-sm mt-1">Control integral y automatización para {client.user.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-blue-900 text-blue-300 flex items-center justify-center font-bold text-3xl mx-auto mb-4">
              {client.user.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-white">{client.user.name}</h2>
            <p className="text-slate-400 text-sm mt-1">{client.user.email}</p>
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Estado: {client.status === "ACTIVE" ? "Activo" : client.status === "DEBTOR" ? "Mora" : "Suspendido"}
            </div>
            <div className="mt-5"><ClientStatusActions clientId={client.id} status={client.status} /></div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-white border-b border-slate-800 pb-2">Datos Personales</h3>
            <div className="text-sm">
              <p className="text-slate-500 mb-1">Teléfono</p>
              <p className="text-slate-200">{client.phone || 'No registrado'}</p>
            </div>
            <div className="text-sm">
              <p className="text-slate-500 mb-1">Edad</p>
              <p className="text-slate-200">{client.age ? `${client.age} años` : 'No registrada'}</p>
            </div>
            <div className="text-sm">
              <p className="text-slate-500 mb-1">Género</p>
              <p className="text-slate-200 capitalize">{client.gender?.toLowerCase() || 'No registrado'}</p>
            </div>
          </div>

          {/* Estado del Ecosistema */}
          {ecosystemData && (
            <div className="bg-slate-900 border border-blue-500/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Ecosistema Conectado</span>
              </div>
              <p className="text-xs text-slate-300">
                {ecosystemData.aiAnalysis.statusTitle}
              </p>
              <div className="text-[11px] text-slate-400 space-y-1">
                <div>Fuerza: <strong className="text-white">{ecosystemData.workoutSummary.strengthScore} pts</strong></div>
                <div>Objetivos: <strong className="text-emerald-400">{ecosystemData.goalsSummary.overallPercentage}% completado</strong></div>
                <div>Calorías meta: <strong className="text-amber-400">{ecosystemData.nutritionSummary.targetCalories || "Sin asignar"} kcal</strong></div>
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-3 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center">
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500 mr-4">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Medidas Corporales</p>
                <p className="text-lg font-semibold text-white">{measurements.length} Registros</p>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center">
              <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500 mr-4">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Rutinas Asignadas</p>
                <p className="text-lg font-semibold text-white">{clientRoutines.length} Rutinas</p>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center">
              <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500 mr-4">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Objetivos Activos</p>
                <p className="text-lg font-semibold text-white">{goals.filter(g => !g.achieved).length} Metas</p>
              </div>
            </div>
          </div>

          <ClientProfileTabs 
            client={client} 
            measurements={measurements}
            routines={clientRoutines}
            availableRoutines={allAvailableRoutines}
            goals={goals}
            nutritionTarget={nutritionTarget}
            ecosystemData={ecosystemData}
          />
        </div>
      </div>
    </div>
  );
}
