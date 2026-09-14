//para empezar hay que decir que este archivo y esta funcion que se declara es innecesaria
//podriamos tener este proyecto sin este archivo y no habria ningun problema

//este archivo seed (semilla) prepara datos iniciales para que el proyecto pueda arrancar con:
//un usuario administrador
//dos productos de ejemplo
//se ejecuta al iniciar el servidor backend y se fija si ya hay usuarios, si no los hay
//crea un usuario y dos productos, como para que haya algo

//son datos iniciales que se insertan en la base de datos



//Importamos una librería para convertir contraseñas en hashes seguros.
const bcrypt = require('bcryptjs');

//importamos el cliente Prisma, creado en lib --> prisma.js
//este cliente permite consultar y modificar la base de datos
const { prisma } = require('../lib/prisma');

//esta operacion asincronica va a meter esos datos iniciales en la base de datos
//siempre de forma asincronica cuando trabajamos con una base de datos
//ya que hay que esperar a que terminen esas operaciones, y pueden tardar
async function datosIniciales() {
  const userCount = await prisma.user.count(); //metemos en userCount, la cantidad de usuarios que ya hay
  if (userCount > 0) return; //si ya hay usuarios, esta funcion se corta aca y no se sigue ejecutando

  const password = await bcrypt.hash('123456', 10); //la contraseña sera 123456, pero la encriptamos

//aca creamos el usuario harcodeado, y le ponemos la contraseña
//modelo de usuario y sus campos esta definido en prisma --> schema.prisma
  await prisma.user.create({ 
    data: {
      username: 'admin',
      email: 'admin@bicileal.com',
      password,
      first_name: 'Admin',
      last_name: 'Bicileal',
    },
  });

//aca creamos dos productos harcodeados
//el modelo de productos y sus campos esta definido en prisma --> schema.prisma
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

//estos datos creados se guardan en la base de datos, que esta en prisma ---> dev.bd


//exportamos la funcion esta que genera estos datos harcodeados
//para que otros archivos puedan utilizarla
module.exports = { datosIniciales }; 


//esto es para usar este archivo como modulo, llamando a esta funcion desde otros archivos 
//es lo que va a suceder en este caso, que sera llamado desde server.js
if (require.main === module) {
  datosIniciales()
    .then(() => console.log('Seed listo'))
    .catch((error) => {
      console.error('Error en seed:', error);
      process.exit(1);
    });
}
