//este archivo protege rutas que requieran que el usuario este autenticado
//el recorrido es asi:
//  petición de React
//        ↓
//  ahi interviene este archivo authMiddleware
//        ↓
//  y se fija: ¿El Token es valido?
//        ↓
// si es asi, manda la peticion al controller, sino la rechaza


//importamos la funcion que verifica un token JWT (Jason Web Token)
//esta funcion revisa si el token fue firmado con la clave correcta, si fue alterado y si esta vencido
const { verificarToken } = require('../data/auth');

//importamos prisma para buscar al usuario en la base de datos
const { prisma } = require('../lib/prisma');


//aca empezamos con la funcion middleware
//recibe req: que es la peticion, res: es la respuesta que se puede enviar, next: es la funcion que permite continuar hacia la controladora
//es asincronica ya que va a consultar la base de datos y estas consultas pueden tardar
async function authMiddleware(req, res, next) {

//leemos el encabezado HTTP, si no existe ese encabezado en la peticion, le asignamos '' para que quede vacio
//y evitamos que quede en undefined que daria un error
  const authHeader = req.headers.authorization || '';

//extraemos el token del encabezado
//primero se fija si el encabezado empieza con 'Bearer'  
//por ejemplo: Bearer abc123
//si empieza correctamente, .slice(7) elimina la palabra 'Bearer ' quedando unicamente lo que viene
//despues, en este caso quedaria abc123
//si este formato no es correcto, entonces pasa lo que hay despues :
//guardamos dentro de token, null

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;


//comprobamos entonces si hay token, si es null, entrara dentro del if rechazando la peticion
//y dejando un mensaje de error en formato json
  if (!token) {
    return res.status(401).json({ error: 'Token requerido.' });
  }

//si hay token va a pasar por aca
  try {
//verificamos el token con la funcion que definimos en data ---> auth.js
//ahi hicimos la logica que verifica si el token es valido
//si todo es correcto, esta funcion va a guardar la informacion
//que se guardó dentro del JWTal crearlo
//ejemplo:
// {
//   id: 3,
//   username: "martin",
//   email: "martinalejandronuniez@gmail.com",
//   iat: 1720000000,
//   exp: 1720003600
// }

    const tokenDecodificado = verificarToken(token);

//como que ya pasamos las validaciones anterior, ahora lo ultimo que hacemos es ver
//si coincide el id del usuario que vino en el token,
//con alguno de los que estan en la tabla usuario, de la base de datos
//si es asi, traemos ese usuario, seleccionando que campos queremos extraer
//(hacemos este de especificar los campos, para no poner el password, asi el password no viaja
//en la req.user de la respuesta, eso mejora la seguridad)

//asi que si encuentra en la tabla de usuarios, el usuario con el mismo id
//del que tiene el token, la base de datos devuelve los datos de ese usuario
//y lo guardamos en user

//podria quedar algo asi:
// const user = {
//   id: 3,
//   username: "martin",
//   email: "martin@email.com",
//   first_name: "Martin",
//   last_name: "Gomez"
// };

    const user = await prisma.user.findUnique({
    where: { id: Number(tokenDecodificado.id) },
    select: {
      id: true,
      username: true,
      email: true,
      first_name: true,
      last_name: true,
    },
  });


  //si en la base de datos no se encuentra un usuario con el id que vino en el token
  //va a devolver un error y user pasaria a valer null
  //aca hacemos esa comprobacion
  //si !user (si vale null)
  //entonces devolvemos un error 401 como respuesta, con el mensaje "usuario no valido"
    if (!user) {
      return res.status(401).json({ error: 'Usuario no válido.' });
    }

//guardamos el usuario encontrado, dentro del objeto req, que representa la peticion del cliente
//asi que ahora dentro de la peticion del usuario, va a estar los datos del usuario en req.user
//asi cualquier controller que se ejecute luego de pasar este middleware,
//va a poder acceder a esos datos del usuario    
//por ejemplo haciendo esto:
//req.user.id    (accede al id del usuario)
//req.user.username    (accede al nombre del usuario)
//req.user.email    (accede al email del usuario)
    req.user = user;

//como todo salio bien si llegamos hasta en cuanto a las validaciones de la peticion
//simplemente hacemos next(), para que esta solicitud continue su camino hacia el controller
//correspondiente que debe hacerse cargo de esta peticion de acuerdo a la ruta del endpoint
    return next();

//si ocurre algun error dentro del try, pasa por aca
//podria ser por ejemplo que el token este vencido, fue alterado, no sea valido, etc
//aca atrapamos ese error y devolvemos como respuesta un 401,
//con el mensaje "token invalido o expirado"
//deteniendo la peticion, e indicando que el usuario no esta autorizado para hacerla
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}


//aca exportamos la funcion de este middleware que hicimos
//para que otros archivos puedan usarla
//estos middlewares van a ser usados siempre por las rutas 
//por ejemplo, en routes --> auth.routes.js

//const authMiddleware = require('../middleware/auth.middleware');

//router.get('/perfil', authMiddleware, obtenerPerfil);

//vemos que el middleware se pone como segun parametro luego del endpoint
//y como tercer parametro el controlador que se va a hacer cargo de ese endpoint
//es decir, primero pasa por el authMiddleware, que es el que hicimos aca
//si todo sale bien, recien ahi con el next(), se dirige la peticion a la controladora obtenerPerfil
module.exports = authMiddleware;
