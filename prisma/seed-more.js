const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const moreExercises = [
  // Pecho
  { name: "Aperturas con Mancuernas", muscleGroup: "Pecho" },
  { name: "Press Inclinado", muscleGroup: "Pecho" },
  { name: "Cruce de Poleas", muscleGroup: "Pecho" },
  { name: "Flexiones (Push-ups)", muscleGroup: "Pecho" },
  // Espalda
  { name: "Remo con Barra", muscleGroup: "Espalda" },
  { name: "Jalón al Pecho", muscleGroup: "Espalda" },
  { name: "Remo Gironda (Polea Baja)", muscleGroup: "Espalda" },
  { name: "Pull-over con Polea", muscleGroup: "Espalda" },
  // Piernas
  { name: "Prensa de Piernas", muscleGroup: "Piernas" },
  { name: "Extensiones de Cuádriceps", muscleGroup: "Piernas" },
  { name: "Curl Femoral Tumbado", muscleGroup: "Piernas" },
  { name: "Peso Muerto Rumano", muscleGroup: "Piernas" },
  { name: "Zancadas (Lunges)", muscleGroup: "Piernas" },
  { name: "Elevación de Talones (Gemelos)", muscleGroup: "Piernas" },
  // Hombros
  { name: "Press Militar", muscleGroup: "Hombros" },
  { name: "Elevaciones Laterales", muscleGroup: "Hombros" },
  { name: "Elevaciones Frontales", muscleGroup: "Hombros" },
  { name: "Pájaros (Hombro Posterior)", muscleGroup: "Hombros" },
  // Brazos
  { name: "Curl Martillo", muscleGroup: "Brazos" },
  { name: "Curl en Banco Scott", muscleGroup: "Brazos" },
  { name: "Press Francés", muscleGroup: "Brazos" },
  { name: "Extensión de Tríceps en Polea", muscleGroup: "Brazos" },
  { name: "Fondos en Paralelas", muscleGroup: "Brazos" },
  // Core/Abdomen
  { name: "Crunch Abdominal", muscleGroup: "Core/Abdomen" },
  { name: "Plancha (Plank)", muscleGroup: "Core/Abdomen" },
  { name: "Elevación de Piernas Colgado", muscleGroup: "Core/Abdomen" },
  { name: "Rueda Abdominal (Ab Wheel)", muscleGroup: "Core/Abdomen" }
];

async function main() {
  console.log("Agregando más ejercicios...");
  const images = {
    Pecho: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=85",
    Espalda: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=900&q=85",
    Piernas: "https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?auto=format&fit=crop&w=900&q=85",
    Hombros: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=85",
    Brazos: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=85",
    "Core/Abdomen": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=85",
  };
  for (const ex of moreExercises) {
    const imageUrl = images[ex.muscleGroup] || images.Piernas;
    const existing = await prisma.exercise.findFirst({ where: { name: ex.name } });
    if (existing) {
      await prisma.exercise.update({ where: { id: existing.id }, data: { ...ex, imageUrl } });
    } else {
      await prisma.exercise.create({ data: { ...ex, imageUrl } });
    }
  }
  console.log("¡Ejercicios adicionales agregados!");
}

main().finally(() => prisma.$disconnect());
