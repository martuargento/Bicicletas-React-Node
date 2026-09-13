const fs = require('fs');
const path = require('path');

const mediaDir = path.join(__dirname, '../../media/bicicletas');
fs.mkdirSync(mediaDir, { recursive: true });

const users = [];
const products = [];
const pedidos = [];

module.exports = {
  mediaDir,
  users,
  products,
  pedidos,
};
