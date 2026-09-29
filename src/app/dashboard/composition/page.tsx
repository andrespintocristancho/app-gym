import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CompositionScreen } from "@/components/screens/CompositionScreen";

export default async function CompositionPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const profile = await prisma.clientProfile.findFirst({
    where: userId && session?.user?.role === "CLIENT" ? { userId } : {},
    include: {
      measurements: { orderBy: { date: "desc" }, take: 1 }
    }
  });

  const m = profile?.measurements?.[0];
  const latestMeasurement = m ? {
    weight: m.weight ?? undefined,
    height: m.height ?? undefined,
    bodyFat: m.bodyFat ?? undefined,
    leanMass: m.leanMass ?? undefined,
    bmi: m.bmi ?? undefined,
    bmr: m.bmr ?? undefined,
    idealWeight: m.idealWeight ?? undefined,
    date: m.date.toISOString()
  } : undefined;

  return <CompositionScreen latestMeasurement={latestMeasurement} />;
}
