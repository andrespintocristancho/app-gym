import { getExercises } from "@/actions/exerciseActions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ExercisesHubClient } from "./ExercisesHubClient";

export default async function ExercisesPage() {
  const session = await getServerSession(authOptions);
  const isTrainer = session?.user?.role === "TRAINER";
  const { exercises = [] } = await getExercises();

  return (
    <ExercisesHubClient
      exercises={exercises as any}
      isTrainer={isTrainer}
    />
  );
}
