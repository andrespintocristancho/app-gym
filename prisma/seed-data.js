const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding exercises...");

  const exercises = [
    {
      name: "Press de Banca",
      muscleGroup: "Pecho",
      imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=85",
      description: "Ejercicio fundamental para el desarrollo del pectoral, tríceps y hombro anterior.",
      technique: "Acostado en un banco plano, agarra la barra un poco más ancho que los hombros. Baja la barra controladamente hasta el pecho y empuja hacia arriba de forma explosiva.",
      commonErrors: "Rebotar la barra en el pecho, levantar los glúteos del banco, no retraer las escápulas."
    },
    {
      name: "Sentadilla Libre",
      muscleGroup: "Piernas",
      imageUrl: "https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?auto=format&fit=crop&w=900&q=85",
      description: "Movimiento rey para el desarrollo de las piernas y el fortalecimiento del core.",
      technique: "Pies separados a la anchura de los hombros. Baja la cadera como si fueras a sentarte, manteniendo el pecho erguido y la espalda recta.",
      commonErrors: "Curvar la espalda, que las rodillas colapsen hacia adentro, no bajar lo suficiente (romper el paralelo)."
    },
    {
      name: "Dominadas",
      muscleGroup: "Espalda",
      imageUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=900&q=85",
      description: "Excelente ejercicio de peso corporal para desarrollar amplitud y fuerza en la espalda.",
      technique: "Cuelga de la barra con un agarre prono. Tira de tu cuerpo hacia arriba llevando el pecho hacia la barra y bajando lentamente.",
      commonErrors: "Usar impulso con las piernas (kipping), no extender completamente los brazos al bajar."
    },
    {
      name: "Curl de Bíceps con Mancuernas",
      muscleGroup: "Brazos",
      imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=85",
      description: "Ejercicio de aislamiento clásico para desarrollar el bíceps braquial.",
      technique: "De pie, sujeta una mancuerna en cada mano. Flexiona los codos llevando las pesas hacia los hombros sin mover la parte superior del brazo.",
      commonErrors: "Balancear el cuerpo para ayudar a levantar el peso, mover los codos hacia adelante."
    }
  ];

  for (const ex of exercises) {
    await prisma.exercise.create({
      data: ex
    });
  }

  console.log("Ejercicios creados con éxito.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
