import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MeasurementsScreen } from "@/components/screens/MeasurementsScreen";

export default async function MeasurementsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const profile = await prisma.clientProfile.findFirst({
    where: userId && session?.user?.role === "CLIENT" ? { userId } : {},
    include: {
      measurements: {
        orderBy: { date: "desc" }
      }
    }
  });

  return (
    <MeasurementsScreen
      clientId={profile?.id || ""}
      measurements={profile?.measurements || []}
    />
  );
}
