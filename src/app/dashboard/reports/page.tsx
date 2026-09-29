import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ReportsScreen } from "@/components/screens/ReportsScreen";
import { computeEcosystemData } from "@/lib/centralEngine";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const profile = await prisma.clientProfile.findFirst({
    where: userId && session?.user?.role === "CLIENT" ? { userId } : {},
    select: { id: true }
  });

  const clientId = profile?.id || "";
  const ecosystem = clientId ? await computeEcosystemData(clientId) : null;

  const report = ecosystem?.hasData ? {
    id: "live-report",
    title: ecosystem.aiAnalysis.title,
    date: new Date().toISOString(),
    period: "15D",
    conclusion: ecosystem.aiAnalysis.conclusion,
    statusType: ecosystem.aiAnalysis.statusType,
    weightDelta: ecosystem.measurementsSummary.weightDelta,
    muscleDelta: ecosystem.measurementsSummary.leanMassDelta,
    waistDelta: ecosystem.measurementsSummary.waistDelta,
    strengthDelta: ecosystem.workoutSummary.strengthDeltaPct
  } : undefined;

  return (
    <ReportsScreen 
      report={report} 
      aiAnalysis={ecosystem?.aiAnalysis}
    />
  );
}
