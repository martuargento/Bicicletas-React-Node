// Este archivo es el controller de productos y pedidos.
// Su trabajo es:

// recibir peticiones del frontend
// validar datos
// consultar la base de datos con Prisma
// devolver respuestas en JSON
// O sea: es la parte que “piensa” y “decide” qué hacer
// cuando el usuario quiere
// ver, crear, editar, borrar productos o pedidos.

//Importamos el cliente Prisma, que permite comunicarnos con la base de datos.
//Gracias a prisma podemos hacer consultas como:
// • prisma.user.findUnique(...)
// • prisma.user.findFirst(...)
// • prisma.user.create(...)

//En este proyecto, el modelo User está definido en prisma --> schema.prisma.

const { prisma } = require('../lib/prisma');


//Esta función toma un producto “crudo” de la base de datos
//y lo transforma en un formato que le sirve al frontend.
// que hace:
// agarra el producto de la base de datos y :
// • toma solo los campos que queremos mostrar
// • convierte precio a número con 2 decimales
// • convierte stock a número
// • si no hay descripción, pone string vacío
// • si no hay imagen, pone null

//Esto sirve para devolver una respuesta ordenada al frontend.

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


//obtener la lista de todos los productos

//en esta funcion hacemos esto:
//“Traeme todos los productos de la base de datos,
// ordenados del más nuevo al más viejo, y devolvéselos al frontend”.

// findMany() = trae muchos registros
// orderBy: { id: 'desc' } = ordena por id de mayor a menor
// map(serializeProducto) = convierte cada producto al formato limpio para el frontend
// res.json(...) = responde con el producto en formato JSON

async function listaDeProductos(req, res) {  
  const productos = await prisma.producto.findMany({
    orderBy: { id: 'desc' },
  });

  return res.json(productos.map(serializeProducto));
}




//crear un producto nuevo

//en esta funcion hacemos esto:
//“Recibimos los datos del producto que quiere crear el usuario
// y los convertimos a un formato válido”.

async function crearProducto(req, res) {
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

  const producto = await prisma.producto.create({
    data: {
      nombre,
      descripcion,
      precio: Number(precio),
      stock: Number(stock),
      imagen: req.file ? `/media/bicicletas/${req.file.filename}` : null,
    },
  });

  return res.status(201).json(serializeProducto(producto));
}


//actualizar un producto
async function actualizarProducto(req, res) {
  const productoExistente = await prisma.producto.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!productoExistente) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }

  const nombre = req.body.nombre !== undefined ? String(req.body.nombre).trim() : productoExistente.nombre;
  const descripcion = req.body.descripcion !== undefined ? String(req.body.descripcion || '') : productoExistente.descripcion;
  const precio = req.body.precio !== undefined ? Number(req.body.precio) : Number(productoExistente.precio);
  const stock = req.body.stock !== undefined ? Number(req.body.stock) : Number(productoExistente.stock);

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

  const producto = await prisma.producto.update({
    where: { id: Number(req.params.id) },
    data: {
      nombre,
      descripcion,
      precio: Number(precio),
      stock: Number(stock),
      imagen: req.file ? `/media/bicicletas/${req.file.filename}` : productoExistente.imagen,
    },
  });

  return res.json(serializeProducto(producto));
}


//borrar un producto
async function borrarProducto(req, res) {
  const productoExistente = await prisma.producto.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!productoExistente) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }

  await prisma.producto.delete({
    where: { id: Number(req.params.id) },
  });

  return res.status(200).json({ mensaje: 'Producto eliminado.' });
}


//obtener la lista de todos los pedidos
async function listaDePedidos(req, res) {
  const pedidos = await prisma.pedido.findMany({
    where: { usuarioId: req.user.id },
    orderBy: { id: 'desc' },
  });

  return res.json(pedidos.map((pedido) => ({
    id: pedido.id,
    usuario: pedido.usuarioId,
    total: Number(pedido.total).toFixed(2),
    creado_en: pedido.creado_en,
  })));
}


//crear un pedido nuevo
async function crearPedido(req, res) {
  const total = Number(req.body.total || 0);

  if (total < 0) {
    return res.status(400).json({ error: 'El total no puede ser negativo.' });
  }

  const pedido = await prisma.pedido.create({
    data: {
      usuarioId: req.user.id,
      total: Number(total),
    },
  });

  return res.status(201).json({
    id: pedido.id,
    usuario: pedido.usuarioId,
    total: Number(pedido.total).toFixed(2),
    creado_en: pedido.creado_en,
  });
}


//exportamos estas funciones para que otros archivos puedan usarlas
module.exports = {
  listaDeProductos,
  crearProducto,
  actualizarProducto,
  borrarProducto,
  listaDePedidos,
  crearPedido,
  serializeProducto,
};
