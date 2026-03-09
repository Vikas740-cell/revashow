require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'vikas@reva.edu.in';
  const password = 'qwertyui';
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Attempting to create admin user...');
    const user = await prisma.user.upsert({
      where: { email },
      update: { password: hashedPassword, role: 'ADMIN' },
      create: {
        email,
        name: 'Vikas Admin',
        password: hashedPassword,
        role: 'ADMIN',
        srn: 'ADMIN-001'
      }
    });

    console.log('✅ Admin user created/updated successfully:', user.email);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.code) console.error('Error Code:', error.code);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
