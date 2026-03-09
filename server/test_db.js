require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Attempting to connect to DB...');
    await prisma.$connect();
    console.log('✅ Connection Successful');

    const user = await prisma.user.findUnique({
      where: { email: 'vikas@reva.edu.in' }
    });

    if (user) {
      console.log('✅ User vikas@reva.edu.in exists in DB');
    } else {
      console.log('❌ User vikas@reva.edu.in DOES NOT exist in DB');
    }

  } catch (error) {
    console.error('❌ Connection Failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
