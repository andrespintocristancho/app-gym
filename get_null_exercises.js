const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const exercises = await prisma.exercise.findMany({ where: { imageUrl: null } });
  console.log(JSON.stringify(exercises.map(e => e.name), null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
