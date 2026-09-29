import { prisma } from "@/lib/prisma";
import { ExerciseDetailScreen } from "@/components/screens/ExerciseDetailScreen";
import { notFound } from "next/navigation";

export default async function ExercisePage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const exercise = await prisma.exercise.findUnique({
    where: { id }
  });

  if (!exercise) {
    return notFound();
  }

  return (
    <ExerciseDetailScreen 
      exerciseId={exercise.id}
      exerciseName={exercise.name}
      muscleGroup={exercise.muscleGroup}
      imageUrl={exercise.imageUrl || undefined}
      technique={exercise.technique || "No se ha proporcionado técnica."}
      commonErrors={exercise.commonErrors || "No hay errores comunes listados."}
    />
  );
}
