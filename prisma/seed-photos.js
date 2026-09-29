const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const photoNames = [
  'Press de Banca', 'Sentadilla Libre', 'Dominadas', 'Remo con Barra',
  'Curl de Bíceps con Mancuernas', 'Extensión de Tríceps en Polea',
  'Peso Muerto Rumano', 'Puente de Glúteo', 'Bird Dog', 'Plancha',
  'Sentadilla Goblet', 'Zancada con Rotación', 'Rotación Externa con Banda',
  'Elevación de Talones', 'Curl Femoral', 'Remo en Polea'
];

async function main() {
  for (let index = 0; index < photoNames.length; index += 1) {
    const exercise = await prisma.exercise.findFirst({ where: { name: photoNames[index] } });
    if (exercise) await prisma.exercise.update({
      where: { id: exercise.id },
      data: { imageUrl: `/fotos/Designer (${index + 10}).png` },
    });
  }
  console.log(`Fotos procesadas: ${photoNames.length}`);
}

main().finally(() => prisma.$disconnect());
