import { getRoutines } from "@/actions/routineActions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { RoutinesHubClient } from "./RoutinesHubClient";

export default async function RoutinesPage() {
  const { routines = [] } = await getRoutines();
  const session = await getServerSession(authOptions);
  const isTrainer = session?.user?.role === "TRAINER";

  return (
    <RoutinesHubClient
      routines={routines as any}
      isTrainer={isTrainer}
    />
  );
}
