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
//si todo es correcto, esta funcion va a guardar el token JWT en tokenDecodificado
    const tokenDecodificado = verificarToken(token);

//aca me quede porque se complico esta parte, seguirla luego porque parece que el token
//es una credencial pero tambien tiene informacion del usuario, y esa informacion
//una vez que pasa el verificarToken, queda guardada dentro de tokenDecodificado
//por eso aca abajo se usa tokenDecodificado.id, porque tiene como los datos del usuario
//pero investigar mejor esta parte
    const user = await prisma.user.findUnique({
      where: { id: Number(tokenDecodificado.id) },
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuario no válido.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}

module.exports = authMiddleware;
