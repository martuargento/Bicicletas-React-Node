//este archivo define los endpoints relacionados con la autenticacion del usuario

//importamos express para poder crear las rutas o endpoints
const express = require('express');

//importamos las funciones de la controladora o controller, que vamos a necesitar
//las que se van a hacer cargo de los endpoints que vamos a definir en este archivo
const { registro, login, perfil } = require('../controllers/auth.controller');

//importamos el middleware que va a verificar si el token JWT es correcto
const authMiddleware = require('../middleware/auth.middleware');

//creamos un router independiente para organizar estas rutas (?)
const router = express.Router();

//aca definimos los endpoints o las rutas de este archivo
//solamente el que tenga el middleware como segundo parametro, es una ruta protegida
//para acceder a ese endpoint se necesita de un token valido, para el resto no es necesario
//y cualquiera pueda hacer solicitudes a esos endpoints
router.post('/registro', registro);
router.post('/login', login);
router.get('/perfil', authMiddleware, perfil);


//exportamos el router que creamos para que pueda ser utilizado en otro archivo
//normalmente va a ser usado en server.js o desde config --> app.js
module.exports = router;
