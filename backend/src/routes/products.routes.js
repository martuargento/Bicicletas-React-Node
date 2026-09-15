const express = require('express');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/auth.middleware');
const {
  listaDeProductos,
  crearProducto,
  actualizarProducto,
  borrarProducto,
  listaDePedidos,
  crearPedido,
} = require('../controllers/product.controller');
const { mediaDir } = require('../data/storage');
 
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, mediaDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

router.get('/productos', listaDeProductos);
router.post('/productos/crear', authMiddleware, upload.single('imagen'), crearProducto);
router.patch('/productos/:id/actualizar', authMiddleware, upload.single('imagen'), actualizarProducto);
router.delete('/productos/:id/eliminar', authMiddleware, borrarProducto);
router.get('/pedidos', authMiddleware, listaDePedidos);
router.post('/pedidos/crear', authMiddleware, crearPedido);
router.get('/health', (req, res) => res.json({ ok: true, service: 'node_backend' }));

module.exports = router;
