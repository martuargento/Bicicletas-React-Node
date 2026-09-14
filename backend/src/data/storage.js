//este archivo prepara la carpeta donde se guardan las imágenes de los productos.

const fs = require('fs');
const path = require('path');

const mediaDir = path.join(__dirname, '../../media/bicicletas');
fs.mkdirSync(mediaDir, { recursive: true });

module.exports = {
  mediaDir,
};
