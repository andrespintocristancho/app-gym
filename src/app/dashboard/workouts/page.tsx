import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { WorkoutsScreen } from "@/components/screens/WorkoutsScreen";
import { computeEcosystemData } from "@/lib/centralEngine";

export default async function WorkoutsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const profile = await prisma.clientProfile.findFirst({
    where: userId && session?.user?.role === "CLIENT" ? { userId } : {},
    select: { 
      id: true,
      routines: {
        include: {
          exercises: {
            include: {
              exercise: true
            }
          }
        }
      },
      workoutSessions: {
        orderBy: { date: "desc" },
        take: 10,
        include: {
          sets: true
        }
      }
    }
  });

  const clientId = profile?.id || "";
  const [allRoutines, ecosystem] = await Promise.all([
    prisma.routine.findMany(),
    clientId ? computeEcosystemData(clientId) : null
  ]);

  const historyWithRoutine = profile?.workoutSessions.map(session => {
    const r = allRoutines.find(rout => rout.id === session.routineId);
    return {
      ...session,
      routine: r ? { name: r.name } : null
    };
  }) || [];

  return (
    <WorkoutsScreen 
      clientId={clientId}
      routines={profile?.routines || []} 
      history={historyWithRoutine} 
      workoutSummary={ecosystem?.workoutSummary}
    />
  );
}
