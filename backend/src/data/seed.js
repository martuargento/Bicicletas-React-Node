const bcrypt = require('bcryptjs');
const { prisma } = require('../lib/prisma');

async function ensureSeed() {
  const userCount = await prisma.user.count();
  if (userCount > 0) return;

  const password = await bcrypt.hash('123456', 10);

  await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@bicileal.com',
      password,
      first_name: 'Admin',
      last_name: 'Bicileal',
    },
  });

  await prisma.producto.createMany({
    data: [
      {
        nombre: 'Bicicleta Trek',
        descripcion: 'Bicicleta de montaña para ciudad y sendero.',
        precio: 150000,
        stock: 5,
        imagen: '/media/bicicletas/trek.jpg',
      },
      {
        nombre: 'Bicicleta Rower',
        descripcion: 'Bicicleta urbana compacta ideal para uso diario.',
        precio: 98000,
        stock: 8,
        imagen: '/media/bicicletas/rower.jpg',
      },
    ],
  });
}

module.exports = { ensureSeed };

if (require.main === module) {
  ensureSeed()
    .then(() => console.log('Seed listo'))
    .catch((error) => {
      console.error('Error en seed:', error);
      process.exit(1);
    });
}
