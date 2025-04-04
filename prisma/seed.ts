const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Crea l'utente admin
  const adminEmail = 'admin@example.com';
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await hash('admin123', 10);
    
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Administrator',
        role: 'ADMIN',
      },
    });

    console.log('Utente admin creato con successo');
  } else {
    console.log('Utente admin già esistente');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 