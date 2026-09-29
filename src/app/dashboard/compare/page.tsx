import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CompareScreen } from "@/components/screens/CompareScreen";

export default async function ComparePage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const profile = await prisma.clientProfile.findFirst({
    where: userId && session?.user?.role === "CLIENT" ? { userId } : {},
    include: {
      measurements: { orderBy: { date: "asc" } }
    }
  });

  return <CompareScreen measurements={profile?.measurements || []} />;
}
