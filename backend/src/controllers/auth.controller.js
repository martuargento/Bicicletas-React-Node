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
// • POST /api/auth/registro

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


//aca hacemos una verificacion de duplicados
//para no volver a registrar 2 veces a un mismo usuario
//entonces verificamos si el usuario ya existe
//en caso de existir , retornamos un status 400 con el mensaje de error
//"este usuario ya existe"
  if (existingUser) {
    return res.status(400).json({ error: 'Ese usuario ya existe.' });
  }
  

//llegado a esta parte del codigo es porque pasó todas las validaciones anteriores

//asi que arrancamos a crear el usuario / registrar nuevo usuario


//Esto transforma la contraseña normal en un hash seguro.
//ejemplo:
//contraseña original: Riverplate912
//hash generado: $2b$10$8x3...
//Eso significa que la base de datos no guarda la contraseña en el texto plano original,
//sino una versión cifrada.

  const hashedPassword = await bcrypt.hash(password, 10);


//aca creamos el usuario en la base de datos
  const newUser = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      first_name: '',
      last_name: '',
    },
  });

//generamos un token JWT
//con la función generarToken creamos el token que identifica al usuario logueado.
//Ese token luego lo va a usar el frontend para saber que el usuario está autenticado.
  const tokens = generarToken(newUser);



// lo siguiente hace que el backend responda con:

// • 201 Created: porque se creó el usuario
// • un objeto user con los datos del usuario creado
// • tokens: token de acceso y refresh, generado por la funcion generarToken()
  return res.status(201).json({
    user: serializeUser(newUser),
    tokens,
  });
}




//loguearse
//aca declaramos la funcion de la controladora que se encarga
//de manejar la peticion al endpoint
// • POST /api/auth/Login

//la funcion es asincronica porque puede tardar ya que va a comunicarse con la base de datos
//req = todo lo que llega del cliente
//res = la respuesta que vamos a devolver desde el backend
async function login(req, res) {
  //extramos el usuario y contraseña que llego en la peticion
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');


  //buscamos el usuario en la base de datos a traves de su username
  //ese usuario se guarda en user
  //si no existe user queda en null
  const user = await prisma.user.findUnique({
    where: { username },
  });

  //si user no existe, osea.. si es null
  //entra al if
  //y retornamos un status 401, con el mensaje de error "credenciales invalidas"
  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas.' });
  }

  //si llegamos aca es porque se encontro el username en la base de datos
  //aca vamos a ver si la contraseña que llego en la peticion
  //coincide con la contraseña guardada en la base de datos, de ese username
  //la comparacion la va a hacer bcrypt, ya que la contraseña que esta guardada
  //en la base de datos para ese usuario, esta encriptada en forma de hash
  //entonces esta funcion bcrypt.compare()
  //se va a encargar de hacer esa comparacion entre la contraseña que vino en la peticion
  //con el hash guardado en la base de datos
  //va a devolver true si coincide
  //y false si no coincide

  //guardamos ese resultado en la constante passwordOk
  const passwordOk = await bcrypt.compare(password, user.password);


  //si la contraseña no coincide
  //retornamos un status 401, con el mensaje de error "credenciales invalidas"
  if (!passwordOk) {
    return res.status(401).json({ error: 'Credenciales inválidas.' });
  }


  //si llegamos aca es porque se encontro el username en la base de datos
  //y la contraseña que vino en la peticion, tambien era correcta
  //asi que en este punto ya esta validado que el usuario es valido
  
  //asi que generamos un token JWT para ese usuario
  //asi puede acceder a los otros endpoints en los que es obligatorio tener un Token JWT
  const tokens = generarToken(user);


  // lo siguiente hace que el backend responda con:

  // • status 200, todo salio bien
  // • un objeto user con los datos del usuario creado
  // • tokens: token de acceso y refresh, generado por la funcion generarToken()
  return res.status(200).json({
    user: serializeUser(user),
    tokens,
  });
}



//perfil
//aca declaramos la funcion de la controladora que se encarga
//de manejar la peticion al endpoint
// • GET /api/auth/perfil

//esta funcion devuelve los datos del usuario logueado
//recordemos que este enpoint tiene un middleware, a diferencia de los 2 endpoints anteriores

//miremos routes --> auth.routes.js :
// router.post('/registro', registro);
// router.post('/login', login);
// router.get('/perfil', authMiddleware, perfil);

//como vemos /perfil es el unico que pasa por authMiddleware primero
//asi que antes de llegar aca primero pasa por:
//middleware --> auth.middleware.js

//recordemos que ese middleware era el “portero de la puerta”
// y ya hizo esto:

// revisó si traía el token
// verificó que el token era válido
// comprobó que no expiró
// buscó al usuario en la base de datos
// guardó ese usuario en req.user

// Por eso, cuando llega la peticion a esta funcion /perfil,
// si logro llegar, es porque ya sabemos con seguridad que:

// el usuario está autenticado
// el token es válido
// el usuario existe
// req.user representa al usuario correcto

//asi que esta funcion perfil no tiene que validar nada, su funcion es hacer esto:
// • toma req.user (el usuario que viene en la peticion)
// • limpia los datos con serializeUser (la funcion que hicimos en este mismo archivo)
// que lo hace es.. de todos los datos obtenidos para ese usuario... de la base de datos
// vamos a devolver estos campos unicamente.. y dejamos afuera la contraseña
// asi que con esta funcion no le devolvemos el usuario completo, todo lo que hay
// para ese usuario en la base de datos, sino los campos que nosotros definimos devolver
// en esa funcion serializeUser()
// • asi que finalmente devolvemos esos datos "publicos" (sin la contraseña) al frontend
function perfil(req, res) {
  return res.json(serializeUser(req.user));
}


//exportamos estas funciones para que otros archivos puedan usarlas
module.exports = {
  registro,
  login,
  perfil,
};
