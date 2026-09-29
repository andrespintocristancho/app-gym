const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const updates = [
    { name: "Zancadas (Lunges)", url: "/fotos/zancadas.jpg" },
    { name: "Press Militar", url: "/fotos/press_militar.jpg" },
    { name: "Press Inclinado", url: "/fotos/Designer (10).png" },
    { name: "Curl en Banco Scott", url: "/fotos/Designer (22).png" },
    { name: "Curl Martillo", url: "/fotos/Designer (21).png" }
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
