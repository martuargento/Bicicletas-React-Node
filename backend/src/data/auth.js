//Este archivo maneja los tokens JWT.
//Jason Web Token

//Importamos la librería que crea y verifica tokens.
const jwt = require('jsonwebtoken');


//Definimos la clave secreta usada para firmar los tokens.

//Primero intenta leer JWT_SECRET_KEY desde las variables de entorno.
//Si no existe, usa una clave de desarrollo.
//esta clave de desarrollo puede usarse mientras se esta haciendo pruebas
//pero para produccion no conviene usarla ya que es facil de adivinar
const SECRET_KEY = process.env.JWT_SECRET_KEY || 'bicileal-node-secret-dev';


//esta es la funcion que genera los tokens
//Recibe un usuario y genera dos tokens:
//access: dura 60 minutos
//refresh: dura 7 días

function generarToken(user) {
  const payload = { id: user.id, username: user.username, email: user.email };

  return {
    refresh: jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' }),
    access: jwt.sign(payload, SECRET_KEY, { expiresIn: '60m' }),
  };
}


//esta funcion verifica si el token fue firmado con la clave correcta, no esta alterado y no esta vencido
function verificarToken(token) {
  return jwt.verify(token, SECRET_KEY);
}


//aca exportamos secret_key y las dos funciones que hicimos, para que otros archivos puedan usarlos
module.exports = {
  SECRET_KEY,
  generarToken,
  verificarToken,
};
