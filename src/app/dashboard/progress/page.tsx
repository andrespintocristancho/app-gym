import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProgressAnalyticsClient } from "./ProgressAnalyticsClient";

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);
  const isTrainer = session?.user?.role === "TRAINER";

  if (isTrainer) {
    const [measurements, clients] = await Promise.all([
      prisma.measurement.findMany({
        include: { client: { include: { user: true } } },
        orderBy: { date: "asc" }
      }),
      prisma.clientProfile.findMany({
        include: { user: true },
        orderBy: { user: { name: "asc" } }
      })
    ]);

    return (
      <ProgressAnalyticsClient
        initialMeasurements={measurements as any}
        clientsList={clients as any}
        isTrainer={true}
      />
    );
  }

  // Client role
  const profile = await prisma.clientProfile.findUnique({
    where: { userId: session?.user?.id },
    include: {
      user: true,
      measurements: {
        orderBy: { date: "asc" },
        include: { client: { include: { user: true } } }
      }
    }
  });

  if (!profile) {
    return <div className="text-center py-12 text-white">Perfil no encontrado.</div>;
  }

  return (
    <ProgressAnalyticsClient
      initialMeasurements={profile.measurements as any}
      isTrainer={false}
      activeClientName={profile.user.name}
    />
  );
}
