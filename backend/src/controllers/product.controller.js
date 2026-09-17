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

//que hace:
// • toma nombre, descripcion, precio, stock desde la peticion con req.body
// • String(...) convierte todo a texto
// • .trim() limpia espacios
// • Number(...) convierte el precio y stock a número

//asi que basicamente creamos los hooks
//nombre, descripcion, precio, stock, y le asignamos los valores que vienen
//en la solicitud, en el req.body
//y dejamos en los hooks los datos listos con el formato correcto para trabajar
//en la creacion de un nuevo producto en la base de datos

async function crearProducto(req, res) {
  const nombre = String(req.body.nombre || '').trim();
  const descripcion = String(req.body.descripcion || '');
  const precio = Number(req.body.precio || 0);
  const stock = Number(req.body.stock || 0);

  //aca chequeamos si nombre tiene algo, si no tiene nada
  //hacemos un return con un status 400, con un mensaje de error diciendo
  //"datos invalidos, el nombre es obligatorio"
  if (!nombre) {
    return res.status(400).json({
      error: 'Datos inválidos.',
      details: { nombre: ['El nombre es obligatorio.'] },
    });
  }

  //ahora chequeamos que el precio no sea menor a 0
  //hacemos entonces un if, preguntando si precio es menor a 0
  //y en caso de cumplirse esa condicion
  //hacemos un return con un status 400, con un mensaje de error diciendo
  //"datos invalidos, el precio no puede ser negativo"

  if (precio < 0) {
    return res.status(400).json({
      error: 'Datos inválidos.',
      details: { precio: ['El precio no puede ser negativo.'] },
    });
  }

  //ahora chequeamos que el stock no sea menor a 0
  //recordemos que al momento de crear un producto, tambien esta el campo stock
  //donde al dar de alta tenemos que poner cuanto de stock hay de ese producto
  //aca vamos a evitar que se ponga un stock negativo, por ejemplo -1

  //hacemos entonces un if, preguntando si el stock es menor a 0
  //y en caso de cumplirse esa condicion
  //hacemos un return con un status 400, con un mensaje de error diciendo
  //"datos invalidos, el stockno puede ser negativo"

  if (stock < 0) {
    return res.status(400).json({
      error: 'Datos inválidos.',
      details: { stock: ['El stock no puede ser negativo.'] },
    });
  }


  //si esta todo bien, llegamos a esta parte del codigo
  //aca realmente vamos a guardar ese nuevo producto en la base de datos

  //lo que hace:  
  // • crea un producto con prisma
  // • guarda nombre, descripción, precio, stock
  // • si llegó una imagen, la guarda en /media/bicicletas/...
  // • si no vino una imagen (deberia estar en req.file)
  // si no existe req.file, ejecuta lo que viene luego del :
  // en el campo imagen guarda un null
  const producto = await prisma.producto.create({
    data: {
      nombre,
      descripcion,
      precio: Number(precio),
      stock: Number(stock),
      imagen: req.file ? `/media/bicicletas/${req.file.filename}` : null,
    },
  });

  //retornamos el producto creado al frontend, en el formato limpio
  //utilizando para eso serializeProducto()
  return res.status(201).json(serializeProducto(producto));
}




//actualizar un producto

//esta funcion es para editar un producto que ya existe

//La idea es:

// • recibir el id del producto en la URL
// • buscar si ese producto existe
// • si existe, actualizar solo lo que vino en la petición
// • si no vino un dato, dejar el valor viejo
// • validar que los nuevos valores sean correctos
// • guardar cambios en la base de datos
// • devolver el producto actualizado

async function actualizarProducto(req, res) {
  //Buscamos si el producto existe usando el id que llega en la URL misma
  //ejemplo:
  //URL: /productos/12

  //entonces req.params.id vale 12
  //ese es el id del producto a actualizar
  //asi que buscamos si existe en la tabla productos, y guardamos ese producto
  //en productoExistente

  //si no lo encuentra, productoExiste sera null
  const productoExistente = await prisma.producto.findUnique({
    where: { id: Number(req.params.id) },
  });

  //si productoExiste es null, entonces entra al if
  //y retornamos un status 404, con el mensaje de error "producto no encontrado"
  if (!productoExistente) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }

  //esta parte toma los nuevos valores del producto si los hay en la solicitud
  //y si no los hay, deja los viejos

  //Dice:

  // si vino nombre en el body, lo uso
  // si no vino, uso el nombre que ya tenía
  // si vino precio, lo uso
  // si no vino, dejo el precio anterior
  // así sucesivamente

  //veamos el primero como ejemplo
  //si req.body.nombre es diferente de undefined
  // (significa que tiene algo, que vino ese dato en la solicitud)
  //entonces guardamos en la constante nombre, en formato texto (string), eso que vino,
  //quitando los espacios al principio y al final si los tiene con .trim()

  // en caso de que esa condicion no se cumpla, se ejecuta lo que viene despues del :
  //que basicamente lo que hace es:
  //guardamos en la constante nombre, productoExistente.nombre
  //que es basicamente el nombre del producto a editar, obtenido desde la base de datos
  //osea que le estamos poniendo en nombre, 
  //lo mismo que tenia ya puesto en la base de datos ese producto

  // y asi hacemos lo mismo con descripcion, precio, stock
  const nombre = req.body.nombre !== undefined ? String(req.body.nombre).trim() : productoExistente.nombre;
  const descripcion = req.body.descripcion !== undefined ? String(req.body.descripcion || '') : productoExistente.descripcion;
  const precio = req.body.precio !== undefined ? Number(req.body.precio) : Number(productoExistente.precio);
  const stock = req.body.stock !== undefined ? Number(req.body.stock) : Number(productoExistente.stock);


  //ahora que tenemos en nombre, descripcion, precio y stock
  //los datos que vamos a terminar asignandole a ese producto a editar
  //vamos a proceder a las validaciones de cada uno de ellos, para asegurarnos
  //de que esten bien

  //si nombre no tiene nada y esta vacio, sera null
  //entonces entra en el if
  //y retornamos un status 400, con el mensaje de error "el nombre es obligatorio"
  if (!nombre) {
    return res.status(400).json({
      error: 'Datos inválidos.',
      details: { nombre: ['El nombre es obligatorio.'] },
    });
  }

  //si precio es menor a 0
  //retornamos un status 400, con el mensaje de error "el precio no puede ser negativo"
  if (precio < 0) {
    return res.status(400).json({
      error: 'Datos inválidos.',
      details: { precio: ['El precio no puede ser negativo.'] },
    });
  }

  //si el stock puesto es menor a 0
  //retornamos un status 400, con el mensaje de error "el precio no puede ser negativo"
  if (stock < 0) {
    return res.status(400).json({
      error: 'Datos inválidos.',
      details: { stock: ['El stock no puede ser negativo.'] },
    });
  }


  //si todas estas validaciones pasan, vamos a llegar aca
  //ya estando seguro de que los datos son correctos
  //asi que procedemos a hacer la actualizacion del producto

  // Qué hace:
  // where: { id: ... } = el producto a actualizar
  // data: { ... } = los nuevos valores
  // si viene una nueva imagen en req.file, se usa esa y se guarda en la ruta especificada
  // si no vino imagen nueva, se deja la imagen que ya tenía
  // Eso hace que la edición no pierda la imagen anterior si no se manda una nueva.

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

  //retornamos entonces como respuesta final el producto ya actualizado
  //se lo devolvemos pasandolo por la funcion serializeProducto()
  //para que le de el producto con los campos publicos permitidos
  return res.json(serializeProducto(producto));
}




//borrar un producto

//aca lo que hacemos es:
// llega el id del producto a borrar por la URL
// verificamos que exista el producto a traves de su id
// y si existe lo borramos de la base de datos

async function borrarProducto(req, res) {
  const productoExistente = await prisma.producto.findUnique({
    where: { id: Number(req.params.id) },
  });

  //si el id del producto no existe en la base de datos,
  //retornamos un status 404, con el mensaje de error "producto no encontrado"
  if (!productoExistente) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }

  //en caso de llegar aca, es porque el id del producto si se encontro
  //en la base de datos
  //asi que borramos el producto que tenga ese id
  await prisma.producto.delete({
    where: { id: Number(req.params.id) },
  });

  //devolvemos un status 200, con el mensaje "producto eliminado"
  return res.status(200).json({ mensaje: 'Producto eliminado.' });
}


//obtener la lista de todos los pedidos

//esta funcion sirve para obtener
//todos los pedidos del usuario que está logueado.

//La idea es:

// • leer el usuario actual desde req.user.id
// recordemos que para que exista req.user
// tuvo que pasar primero por middleware --> auth.middleware.js
// osea que ya se verifico que el usuario este bien logueado y con un token valido
// recien ahi el middleware pone los datos del usuario en req.user
// luego:
// • buscamos en la tabla pedido todos los pedidos de ese usuario
// • los ordenarlos del más reciente al más viejo
// • los devolvemos en un formato limpio para el frontend

async function listaDePedidos(req, res) {
  //Buscamos los pedidos del usuario logueado
  //Esto hace una consulta a Prisma:

  // findMany() = trae muchos registros
  // where: { usuarioId: req.user.id } = solo los pedidos del usuario actual
  // orderBy: { id: 'desc' } = los ordena desde el más nuevo al más viejo
  // O sea: “traeme todos los pedidos de este usuario, ordenados por id descendente”.

  const pedidos = await prisma.pedido.findMany({
    where: { usuarioId: req.user.id },
    orderBy: { id: 'desc' },
  });

  //aca transformamos cada pedido antes de devolverlo
  //Esto recorre cada pedido encontrado para ese usuario con .map()
  //y devuelve un objeto más limpio.

  return res.json(pedidos.map((pedido) => ({
    id: pedido.id,
    usuario: pedido.usuarioId,
    total: Number(pedido.total).toFixed(2),
    creado_en: pedido.creado_en,
  })));
}


  // en resumen:

  // toma el usuario autenticado desde req.user.id
  // consulta sus pedidos
  // los ordena
  // devuelve solo la info útil para el frontend


  // ----------




//crear un pedido nuevo

// Esta función crea un nuevo pedido para el usuario que ya está autenticado.
//
async function crearPedido(req, res) {
  //Tomamos el total que viene en el body
  //lo convertimos en numero y lo guardamos en total

  //si viene vacío o undefined, usa 0

  //Ejemplo:

  // si manda 1500 → total = 1500
  // si manda undefined → total = 0

  const total = Number(req.body.total || 0);


  //validamos que el total no sea negativo
  if (total < 0) {
    //si el total es negativo entra retornamos un status 400,
    //con el mensaje de error "el total no puede ser negativo"
    return res.status(400).json({ error: 'El total no puede ser negativo.' });
  }

  //aca creamos el pedido en la base de datos

  //aca hacemos lo principal:

  // • usuarioId: req.user.id → asociamos el pedido con el usuario autenticado
  // usuarioId es un campo de la tabla pedidos, ahi guardamos el id del usuario
  // que hizo el pedido
  // • total: Number(total) → guardamos el total como número
  const pedido = await prisma.pedido.create({
    data: {
      usuarioId: req.user.id,
      total: Number(total),
    },
  });

  //ahora repondemos con el pedido creado
  //lo hacemos con un status 201, y el json limpio del pedido creado
  return res.status(201).json({
    id: pedido.id,
    usuario: pedido.usuarioId,
    total: Number(pedido.total).toFixed(2),
    creado_en: pedido.creado_en,
  });
}


  // en resumen:

  // • recibe el total del pedido
  // • valida que el total sea válido
  // • crea un registro en la tabla pedido
  //   asignando en el campo usuarioId, el id del usuario autenticado
  // • devuelve el pedido creado


  // ----------


//exportamos estas funciones para que otros archivos puedan usarlas
//en este caso seran usadas por routes --> products.routes.js

module.exports = {
  listaDeProductos,
  crearProducto,
  actualizarProducto,
  borrarProducto,
  listaDePedidos,
  crearPedido,
  serializeProducto,
};
