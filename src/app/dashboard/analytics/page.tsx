import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AnalyticsScreen, AnalyticsMeasurement, AnalyticsWorkoutSession } from "@/components/screens/AnalyticsScreen";
import { computeEcosystemData } from "@/lib/centralEngine";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const profile = await prisma.clientProfile.findFirst({
    where: userId && session?.user?.role === "CLIENT" ? { userId } : {},
    select: { id: true }
  });

  const clientId = profile?.id || "";
  const ecosystem = clientId ? await computeEcosystemData(clientId) : null;

  const [rawMeasurements, rawWorkouts] = await Promise.all([
    clientId ? prisma.measurement.findMany({ where: { clientId }, orderBy: { date: "asc" } }) : [],
    clientId ? prisma.workoutSession.findMany({ where: { clientId }, orderBy: { date: "asc" } }) : []
  ]);

  const measurements: AnalyticsMeasurement[] = rawMeasurements.map(m => ({
    date: m.date.toISOString(),
    weight: m.weight,
    leanMass: m.leanMass,
    bodyFat: m.bodyFat,
    chest: m.chest,
    rightArm: m.rightArm,
    waist: m.waist,
    rightThigh: m.rightThigh,
    rightCalf: m.rightCalf,
  }));

  const workoutSessions: AnalyticsWorkoutSession[] = rawWorkouts.map(w => ({
    date: w.date.toISOString(),
    durationMin: w.durationMin
  }));

  return (
    <AnalyticsScreen
      measurements={measurements}
      workoutSessions={workoutSessions}
      ecosystem={ecosystem}
    />
  );
}
