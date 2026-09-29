const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const updates = [
    { name: "Press de Banca", url: "/fotos/press_de_banca.jpg" },
    { name: "Sentadilla (Squat)", url: "/fotos/sentadilla.jpg" },
    { name: "Flexiones (Push-ups)", url: "/fotos/flexiones.jpg" },
    { name: "Jalón al Pecho", url: "/fotos/jalon_al_pecho.jpg" }
  ];
  for (const up of updates) {
    await prisma.exercise.updateMany({
      where: { name: up.name },
      data: { imageUrl: up.url }
    });
  }
  console.log("Updated images.");
}
main().catch(console.error).finally(() => prisma.$disconnect());
