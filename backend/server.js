// es el archivo que “enciende” el backend

// es el punto de entrada del backend: 
// • arranca la aplicación 
// • prepara la base con datos iniciales 
// • y pone el servidor a escuchar.


// Esto intenta cargar variables de entorno desde un archivo .env si existe.

// dotenv es una librería para leer ese archivo.
// .config() activa esa lectura.
// Pero en este proyecto no aparece ese archivo, 
// así que esta línea no es esencial para que corra, 
// simplemente intenta cargar configuración extra si la hay.

require('dotenv').config();

// Acá importamos la aplicación Express que está configurada en config --> app.js.

// app es la app principal del backend.
// Ese archivo ya tiene:
// Express
// CORS
// middlewares
// rutas
// manejo de 404

// Entonces aca en server.js no armamos la app; la importamos para arrancarla.

const app = require('./src/config/app');

// importamos la función datosIniciales desde seed.js.

// Esa función crea un usuario admin y productos de ejemplo.
// al iniciar el proyecto, se asegura de que haya datos base para trabajar.

const { datosIniciales } = require('./src/data/seed');

// definimos el puerto del servidor.

// process.env.PORT intenta leer un puerto desde variables de entorno.
// si no existe, usa 8000.
// En este proyecto, como no hay .env, el backend va a usar 8000 por defecto.

const PORT = process.env.PORT || 8000;


// definimos la función asíncrona llamada start.

// es async ya que los datos iniciales se van a cargar en la base de datos
// y esto puede tardar
// asi que esperamos a que termine la funcion datosIniciales(), antes de abrir el servidor.

async function start() {
//  ejecutamos la función de carga de datos iniciales que hicimos en data --> seed.js
// await espera a que termine.

  await datosIniciales();

// aca es donde realmente prendemos el servidor.

// app.listen() hace que la app Empiece a escuchar peticiones HTTP.
// PORT es el puerto definido antes.
// La función dentro del callback se ejecuta cuando el servidor ya está levantado.
  app.listen(PORT, () => {
    //Esto imprime ese mensaje en la terminal para avisar que el servidor ya esta corriendo
    //y en que puerto esta escuchando las peticiones HTTP
    console.log(`Node backend escuchando en http://localhost:${PORT}`);
  });
}

// ejecutamos la función start() recien definida y capturamos errores si algo falla.

// como start() es async, devuelve una promesa
// .catch() sirve para atrapar cualquier error del arranque

start().catch((error) => {
  console.error('Error al iniciar backend:', error);
  process.exit(1);
});
