import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoalsScreen } from "@/components/screens/GoalsScreen";
import { computeEcosystemData } from "@/lib/centralEngine";

export default async function GoalsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const profile = await prisma.clientProfile.findFirst({
    where: userId && session?.user?.role === "CLIENT" ? { userId } : {},
    select: { id: true }
  });

  const clientId = profile?.id || "";
  const ecosystem = clientId ? await computeEcosystemData(clientId) : null;

  const goals = ecosystem?.goalsSummary.goals || [];

  return (
    <GoalsScreen
      clientId={clientId}
      initialGoals={goals}
    />
  );
}
