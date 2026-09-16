//Este archivo cumple una función parecida a auth.routes.js,
//pero agrupa las rutas relacionadas con:
// • productos
// • pedidos
// • subida de imágenes
// • estado del backend

// La diferencia es que acá aparece algo nuevo: Multer:
// que sirve para recibir archivos enviados desde React.



//Importamos Express porque necesitamos crear un router mas abajo en el codigo
const express = require('express');

//Importamos multer, una herramienta que permite recibir archivos enviados desde el frontend.
const multer = require('multer');

//Importamos path, una herramienta de Node para trabajar con rutas de archivos y extensiones.
const path = require('path');

//Importamos el middleware que hicimos, que verifica si el usuario tiene un token JWT válido.
const authMiddleware = require('../middleware/auth.middleware');

//importamos las funciones de controllers --> product.controller.js
const {
  listaDeProductos,
  crearProducto, 
  actualizarProducto,
  borrarProducto,
  listaDePedidos,
  crearPedido,
} = require('../controllers/product.controller');

//Importamos mediaDir, que es la variable creada y exportada en el archivo data --> storage.js
// que representa la carpeta donde se van a guardar las imágenes subidas.
// Por ejemplo, podría apuntar a:
// backend/media/bicicletas
const { mediaDir } = require('../data/storage');
 
//Creamos un router independiente para agrupar las rutas de productos y pedidos.
//Después, en app.js, este router se conecta así:
//app.use('/api', productRoutes);
const router = express.Router();

//Acá le indicamos a Multer cómo debe guardar los archivos en el disco.
//diskStorage significa:
//"Guardá físicamente el archivo en una carpeta del servidor."
const storage = multer.diskStorage({
  //Esta función le dice a Multer dónde guardar el archivo.
  //Recibe tres datos:
  // • req  -> la solicitud completa
  // • file -> el archivo que envió el usuario
  // • cb   -> callback para avisar si todo salió bien o hubo un error

  //cb(null, mediaDir) esta parte significa:
  // • null     -> no hubo error
  // • mediaDir -> guardá el archivo en esta carpeta


  //en criollo la siguiente linea dice:
  //"Cuando llegue una imagen, guardala dentro de la carpeta representada por mediaDir"
  destination: (req, file, cb) => cb(null, mediaDir),

  //Esta función decide con qué nombre se va a guardar el archivo.
  filename: (req, file, cb) => {
    //Obtenemos la extensión original del archivo.
    //por ejemplo:
    // foto-bici.png -> .png
    // foto-bici.jpg -> .jpg
    // Si por alguna razón no se encuentra una extensión, ||  usamos .jpg como valor alternativo.
    const ext = path.extname(file.originalname) || '.jpg';
    //Creamos un nombre nuevo para el archivo.
    //El nombre combina:
    //Date.now() : La fecha y hora actual expresada en milisegundos.
    //Math.random().toString(36).slice(2):  Una parte aleatoria.
    //El resultado podría ser algo parecido a:
    //1726348291000-k8fj29d3.jpg

    //Esto evita que dos imágenes tengan exactamente el mismo nombre
    //y una reemplace accidentalmente a la otra.

    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

    // Le informamos a Multer:
    //"No hubo error y el nombre nuevo del archivo será fileName.""
    cb(null, fileName);
  },
});


//ahora vamos a crear el middleware de subida

//Creamos una configuración de Multer usando el almacenamiento que definimos anteriormente.
//Después podemos usar upload en las rutas que reciben imágenes, por ejemplo:
//upload.single('imagen')
//significa:
//"Esta ruta espera recibir un solo archivo y el campo del formulario debe llamarse imagen.""
//Ese nombre debe coincidir con el que usa React al enviar el archivo:
//formData.append('imagen', archivo);

const upload = multer({ storage });


// aca definimos los endpoints para los productos y pedidos
router.get('/productos', listaDeProductos);
router.post('/productos/crear', authMiddleware, upload.single('imagen'), crearProducto);
router.patch('/productos/:id/actualizar', authMiddleware, upload.single('imagen'), actualizarProducto);
router.delete('/productos/:id/eliminar', authMiddleware, borrarProducto);
router.get('/pedidos', authMiddleware, listaDePedidos);
router.post('/pedidos/crear', authMiddleware, crearPedido);
router.get('/health', (req, res) => res.json({ ok: true, service: 'node_backend' }));

module.exports = router;
