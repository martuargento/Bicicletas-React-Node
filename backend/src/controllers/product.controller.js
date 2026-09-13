const { products } = require('../data/storage');

function serializeProducto(producto) {
  return {
    id: producto.id,
    nombre: producto.nombre,
    descripcion: producto.descripcion || '',
    precio: Number(producto.precio).toFixed(2),
    stock: Number(producto.stock),
    imagen: producto.imagen || null,
    creado_en: producto.creado_en,
  };
}

function listProducts(req, res) {
  return res.json(products.slice().sort((a, b) => b.id - a.id).map(serializeProducto));
}

function createProduct(req, res) {
  const nombre = String(req.body.nombre || '').trim();
  const descripcion = String(req.body.descripcion || '');
  const precio = Number(req.body.precio || 0);
  const stock = Number(req.body.stock || 0);

  if (!nombre) {
    return res.status(400).json({
      error: 'Datos inválidos.',
      details: { nombre: ['El nombre es obligatorio.'] },
    });
  }

  if (precio < 0) {
    return res.status(400).json({
      error: 'Datos inválidos.',
      details: { precio: ['El precio no puede ser negativo.'] },
    });
  }

  if (stock < 0) {
    return res.status(400).json({
      error: 'Datos inválidos.',
      details: { stock: ['El stock no puede ser negativo.'] },
    });
  }

  const producto = {
    id: Date.now(),
    nombre,
    descripcion,
    precio: Number(precio).toFixed(2),
    stock: Number(stock),
    imagen: req.file ? `/media/bicicletas/${req.file.filename}` : null,
    creado_en: new Date().toISOString(),
  };

  products.push(producto);
  return res.status(201).json(serializeProducto(producto));
}

function updateProduct(req, res) {
  const producto = products.find((item) => item.id === Number(req.params.id));
  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }

  const nombre = req.body.nombre !== undefined ? String(req.body.nombre).trim() : producto.nombre;
  const descripcion = req.body.descripcion !== undefined ? String(req.body.descripcion || '') : producto.descripcion;
  const precio = req.body.precio !== undefined ? Number(req.body.precio) : Number(producto.precio);
  const stock = req.body.stock !== undefined ? Number(req.body.stock) : Number(producto.stock);

  if (!nombre) {
    return res.status(400).json({
      error: 'Datos inválidos.',
      details: { nombre: ['El nombre es obligatorio.'] },
    });
  }

  if (precio < 0) {
    return res.status(400).json({
      error: 'Datos inválidos.',
      details: { precio: ['El precio no puede ser negativo.'] },
    });
  }

  if (stock < 0) {
    return res.status(400).json({
      error: 'Datos inválidos.',
      details: { stock: ['El stock no puede ser negativo.'] },
    });
  }

  producto.nombre = nombre;
  producto.descripcion = descripcion;
  producto.precio = Number(precio).toFixed(2);
  producto.stock = Number(stock);

  if (req.file) {
    producto.imagen = `/media/bicicletas/${req.file.filename}`;
  }

  return res.json(serializeProducto(producto));
}

function deleteProduct(req, res) {
  const index = products.findIndex((item) => item.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }

  products.splice(index, 1);
  return res.status(200).json({ mensaje: 'Producto eliminado.' });
}

function listPedidos(req, res) {
  const { pedidos } = require('../data/storage');
  const usuarioPedidos = pedidos.filter((pedido) => pedido.usuario === req.user.id).sort((a, b) => b.id - a.id);
  return res.json(usuarioPedidos.map((pedido) => ({
    id: pedido.id,
    usuario: pedido.usuario,
    total: Number(pedido.total).toFixed(2),
    creado_en: pedido.creado_en,
  })));
}

function createPedido(req, res) {
  const { pedidos } = require('../data/storage');
  const total = Number(req.body.total || 0);

  if (total < 0) {
    return res.status(400).json({ error: 'El total no puede ser negativo.' });
  }

  const pedido = {
    id: Date.now(),
    usuario: req.user.id,
    total: Number(total).toFixed(2),
    creado_en: new Date().toISOString(),
  };

  pedidos.push(pedido);
  return res.status(201).json({
    id: pedido.id,
    usuario: pedido.usuario,
    total: Number(pedido.total).toFixed(2),
    creado_en: pedido.creado_en,
  });
}

module.exports = {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  listPedidos,
  createPedido,
  serializeProducto,
};
