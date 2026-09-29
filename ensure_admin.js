const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Check existing users
  let users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true }
  });
  console.log("Current users:", JSON.stringify(users, null, 2));

  // Ensure admin user exists with password admin123
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gym.com' },
    update: { 
      name: 'Jefferson Cobos',
      role: 'TRAINER',
      password: hashedPassword
    },
    create: {
      email: 'admin@gym.com',
      name: 'Jefferson Cobos',
      password: hashedPassword,
      role: 'TRAINER',
    },
  });
  console.log("Admin user confirmed:", { email: admin.email, role: admin.role, name: admin.name });
}

main().catch(console.error).finally(() => prisma.$disconnect());
