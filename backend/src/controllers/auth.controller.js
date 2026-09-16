//Este es el controller de autenticación.
//su trabajo es recibir las solicitudesque esten relacionadas con usuarios,
//procesarlas y devolver una respuesta.

//en resumen hace esto:

// La ruta recibe la petición
//         ↓
// el controller piensa y ejecuta la lógica
//         ↓
// consulta la base de datos si hace falta
//         ↓
// devuelve una respuesta al frontend


//Este archivo tiene tres funciones principales:

// registro  -> crear un usuario
// login     -> iniciar sesión
// perfil    -> devolver los datos del usuario autenticado



//importamos bcrypt, sirve para trabajar con contraseñas de forma segura.
//No deberíamos guardar una contraseña así:
//  Riverplate912
//La guardamos transformada, por ejemplo:
//  $2b$10$8x3...
//Esa transformación se llama hash.


// Bcrypt permite hacer dos cosas:
// • bcrypt.hash(...)
// Convierte una contraseña normal en un hash.
// • bcrypt.compare(...)
// Compara una contraseña escrita por el usuario con el hash guardado en la base de datos.

const bcrypt = require('bcryptjs');

//Importamos el cliente Prisma, que permite comunicarnos con la base de datos.
//Gracias a prisma podemos hacer consultas como:
// • prisma.user.findUnique(...)
// • prisma.user.findFirst(...)
// • prisma.user.create(...)

//En este proyecto, el modelo User está definido en prisma --> schema.prisma.

const { prisma } = require('../lib/prisma');

//Importamos la función que hicimos en data --> auth.js que crea los tokens JWT.
const { generarToken } = require('../data/auth');


//definimos la función serializeUser
//Esta función recibe un usuario completo
//y devuelve solamente los datos que queremos enviar al frontend.
//en criollo:
//Tenemos un usuario en la base de datos,
// pero no queremos mandar todo tal cual está guardado.
// Elegimos qué datos pueden salir.

function serializeUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    first_name: user.first_name || '',
    last_name: user.last_name || '',
  };
}



//registrar un nuevo usuario
//Esta función se ejecuta cuando llega esta solicitud:
//POST /api/auth/registro

//Es async porque va a realizar operaciones en la base de datos que pueden tardar
async function registro(req, res) {
  //Obtenemos los datos enviados en la peticion
  //string convierte los valores a texto
  //.trim() elimina espacios innecesarios al principio y al final del texto
  const username = String(req.body.username || '').trim();
  const email = String(req.body.email || '').trim();
  const password = String(req.body.password || '');

  //Validamos los campos obligatorios
  //Acá preguntamos:
  //¿Falta alguno de los tres datos?
  //en caso de que entre al if,
  //se detiene la funcion con el return, devolviendo el mensaje de error

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Completa username, email y password.' });
  }

  //en caso de no haber entrado en el if anterior, se ejecuta este codigo
  //donde buscamos si el usuario que nos mando en la solicitud, ya existe o no

  //Le pedimos a Prisma que busque el primer usuario que tenga:
  //el mismo username o el mismo email del que vino en la solicitud
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  //me quede aca -----------------------------------------

  if (existingUser) {
    return res.status(400).json({ error: 'Ese usuario ya existe.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      first_name: '',
      last_name: '',
    },
  });

  const tokens = generarToken(newUser);

  return res.status(201).json({
    user: serializeUser(newUser),
    tokens,
  });
}


//loguearse
async function login(req, res) {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas.' });
  }

  const passwordOk = await bcrypt.compare(password, user.password);
  if (!passwordOk) {
    return res.status(401).json({ error: 'Credenciales inválidas.' });
  }

  const tokens = generarToken(user);

  return res.status(200).json({
    user: serializeUser(user),
    tokens,
  });
}

//perfil
function perfil(req, res) {
  return res.json(serializeUser(req.user));
}


//exportamos estas funciones para que otros archivos puedan usarlas
module.exports = {
  registro,
  login,
  perfil,
};
