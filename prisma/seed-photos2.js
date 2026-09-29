const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const catalog = [
  [/barbell.*back|goblet_squat/i, 'Sentadilla Libre', 'Piernas'],
  [/leg_curls/i, 'Curl Femoral', 'Piernas'],
  [/leg_extensions/i, 'Extensión de Cuádriceps', 'Piernas'],
  [/forward_lunge/i, 'Zancadas', 'Piernas'],
  [/lunge_with_rot/i, 'Zancada con Rotación de Tronco', 'Piernas'],
  [/conventional_deadlift/i, 'Peso Muerto Convencional', 'Piernas'],
  [/barbell_bench/i, 'Press de Banca', 'Pecho'],
  [/T-Bar_Row/i, 'Remo en Barra T', 'Espalda'],
  [/cable_tricep/i, 'Extensión de Tríceps en Polea', 'Brazos'],
  [/dumbbell_bicep/i, 'Curl de Bíceps con Mancuernas', 'Brazos'],
  [/overhead_shoul/i, 'Press Militar', 'Hombros'],
  [/shoulder_exter/i, 'Rotación Externa con Banda', 'Hombros'],
  [/shoulder_rotation/i, 'Rotación de Hombros', 'Hombros'],
  [/forearm_plank/i, 'Plancha', 'Core/Abdomen'],
  [/Bird_Dog/i, 'Bird Dog', 'Core/Abdomen'],
  [/glute_bridge/i, 'Puente de Glúteo', 'Piernas'],
  [/90_90|hip_flexor|hip_stretch/i, 'Movilidad de Cadera', 'Movilidad'],
];

async function main() {
  const folder = path.join(process.cwd(), 'public', 'fotos2');
  const files = fs.readdirSync(folder).filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file));
  for (const file of files) {
    const match = catalog.find(([pattern]) => pattern.test(file));
    if (!match) continue;
    const [, name, muscleGroup] = match;
    const existing = await prisma.exercise.findFirst({ where: { name } });
    const data = { name, muscleGroup, imageUrl: `/fotos2/${file}` };
    if (existing) await prisma.exercise.update({ where: { id: existing.id }, data });
    else await prisma.exercise.create({ data });
    console.log(`${name}: ${file}`);
  }
}

main().finally(() => prisma.$disconnect());
