const express = require('express');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/auth.middleware');
const {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  listPedidos,
  createPedido,
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

router.get('/productos', listProducts);
router.post('/productos/crear', authMiddleware, upload.single('imagen'), createProduct);
router.patch('/productos/:id/actualizar', authMiddleware, upload.single('imagen'), updateProduct);
router.delete('/productos/:id/eliminar', authMiddleware, deleteProduct);
router.get('/pedidos', authMiddleware, listPedidos);
router.post('/pedidos/crear', authMiddleware, createPedido);
router.get('/health', (req, res) => res.json({ ok: true, service: 'node_backend' }));

module.exports = router;
