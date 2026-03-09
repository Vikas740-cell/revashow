require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'vikas@reva.edu.in';
  const password = 'qwertyui';
  const hashedPassword = await bcrypt.hash(password, 10);

  const vikas = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'ADMIN', // Giving full access as requested for first login
    },
    create: {
      email,
      name: 'Vikas Admin',
      password: hashedPassword,
      role: 'ADMIN',
      srn: 'REVA-ADMIN-01',
      department: 'Administration',
      phone: '9999999999'
    },
  });

  console.log({ vikas });
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
