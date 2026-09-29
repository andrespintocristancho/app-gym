import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EvolutionScreen } from "@/components/screens/EvolutionScreen";

export default async function EvolutionPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const profile = await prisma.clientProfile.findFirst({
    where: userId && session?.user?.role === "CLIENT" ? { userId } : {},
    include: {
      measurements: {
        orderBy: { date: "asc" }
      }
    }
  });

  return (
    <EvolutionScreen
      measurements={profile?.measurements || []}
    />
  );
}
