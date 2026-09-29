const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const exercises = await prisma.exercise.findMany();
  console.log(JSON.stringify(exercises, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
