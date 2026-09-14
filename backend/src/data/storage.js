//este archivo prepara la carpeta donde se guardan las imágenes de los productos.


//fs significa file system, es un modulo nativo de node para trabajar con archivos, carpetas,
//creacion, lectura, modificacion, eliminacion, etc.
const fs = require('fs');

//path tambien es un modulo nativo de node, sirve para contruir rutas correctamente
const path = require('path');


//aca construimos la ruta de las imagenes
//esta linea crea la ruta absoluta hacia backend/media/bicicletas
const mediaDir = path.join(__dirname, '../../media/bicicletas');


//aca creamos la carpeta si no existe, (en este caso crearia media/bicicletas)
//si la carpeta ya existe no pasa nada porque usamos recursive: true y evita ese error
fs.mkdirSync(mediaDir, { recursive: true });


// exportamos la variable creada, mediaDir
//que es donde van a estar las imagenes
//para que otros achivos puedan usarla
//en este caso el archivo que la va a usar va a ser routes --> product.routes.js
//ahi mediante su codigo va a hacer que cuando el usuario suba una imagen, la guarde en
//la carpeta indicada por mediaDir
module.exports = {
  mediaDir,
};
