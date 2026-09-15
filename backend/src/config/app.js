//en este archivo no tenemos la logica ni de login ni de productos
//su funcion es armar la aplicacion express

const express = require('express'); //esto es para crear el servidor web
const cors = require('cors'); //permite que react se comunique con este backend dede otro puerto
const morgan = require('morgan'); // es para mostrar por la terminal las peticiones recibidas
const path = require('path');


//importamos las rutas, los endpoints
const authRoutes = require('../routes/auth.routes');
const productRoutes = require('../routes/products.routes');

// Creamos la aplicación Express.
// Acá configuramos el backend, pero el servidor empieza a escuchar
// peticiones cuando server.js ejecuta app.listen().
const app = express();

//usamos cors y definimos que las peticiones permitidas entrantes van a ser desde el puerto 5173
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, 
}));

//usamos estos middleware (interceptores de las solicitudes)
//que van a permitir a express leer datos enviados desde react por el cliente
//por ejemplo si nos mandan un json, express.json() va a hacer que esos datos esten disponibles
//en req.body de la solicitud
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//aca usamos morganque es para mostrar las peticiones entrantes por la terminal
app.use(morgan('dev'));

//esto hace que las imagenes guardads en /media puedan ser accedidas desde el navegador
app.use('/media', express.static(path.join(__dirname, '../../media')));

// Conectamos los routers independientes con la aplicación principal.
//
// authRoutes contiene las rutas de autenticación.
// El prefijo '/api/auth' se combina con cada ruta interna.
//
// Por ejemplo:
// router.post('/login', login)
// se convierte en:
// POST /api/auth/login
app.use('/api/auth', authRoutes);

// productRoutes contiene las rutas de productos, pedidos y health.
// El prefijo '/api' se combina con cada ruta interna.
//
// Por ejemplo:
// router.get('/productos', listaDeProductos)
// se convierte en:
// GET /api/productos
app.use('/api', productRoutes);

//esta parte es un middleware de fallback para rutas inexistentes:
//se va a ejecutar cuando express recorra todas las rutas en el orden que aparecen en la carpeta routes
//si la peticion no coincide con ninguno de esos endpoints va a venir aca y va a entrar a este
//dando como respuesta ese 404, y el mensaje "ruta no encontrada"
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

module.exports = app;
