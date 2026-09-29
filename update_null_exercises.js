const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mapping = {
  "Extensiones de Cuádriceps": "/fotos2/Person_performing_leg_extensions_20260926224738.jpg",
  "Curl Femoral Tumbado": "/fotos2/Person_performing_leg_curls_20260926224733.jpg",
  "Zancadas (Lunges)": "/fotos2/Person_performing_lunge_with_rot._20260926224723.jpg",
  "Plancha (Plank)": "/fotos2/Person_performing_forearm_plank_20260926224709.jpg",
  "Press Inclinado": "/fotos2/Person_performing_barbell_bench_._20260926224752.jpg",
  "Aperturas con Mancuernas": "/fotos/Designer (10).png",
  "Cruce de Poleas": "/fotos/Designer (11).png",
  "Remo Gironda (Polea Baja)": "/fotos/Designer (12).png",
  "Pull-over con Polea": "/fotos/Designer (14).png",
  "Prensa de Piernas": "/fotos/Designer (15).png",
  "Elevación de Talones (Gemelos)": "/fotos/Designer (17).png",
  "Elevaciones Laterales": "/fotos/Designer (18).png",
  "Elevaciones Frontales": "/fotos/Designer (19).png",
  "Pájaros (Hombro Posterior)": "/fotos/Designer (20).png",
  "Curl Martillo": "/fotos/Designer (21).png",
  "Curl en Banco Scott": "/fotos/Designer (22).png",
  "Press Francés": "/fotos/Designer (23).png",
  "Fondos en Paralelas": "/fotos/Designer (24).png",
  "Crunch Abdominal": "/fotos/Designer (25).png",
  "Elevación de Piernas Colgado": "/fotos/Designer (10).png",
  "Rueda Abdominal (Ab Wheel)": "/fotos/Designer (11).png"
};

async function main() {
  for (const [name, url] of Object.entries(mapping)) {
    await prisma.exercise.updateMany({
      where: { name },
      data: { imageUrl: url }
    });
  }
  console.log("Updated remaining exercises with photos.");
}
main().catch(console.error).finally(() => prisma.$disconnect());
