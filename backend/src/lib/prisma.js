//este es el archivo que crea y exporta el cliente que permite comunicarse con
//la base de datos mediante Prisma


//importamos PrismaClient desde el paquete generado por Prisma
//PrismaClient es una clase que conoce:
//• La conexion definida en prisma --> schema.prisma
//• los modelos de la base de datos
//• las operaciones disponibles sobre cada modelo
const { PrismaClient } = require('@prisma/client');


//creamos una instancia de este cliente PrismaClient
//esta instancia va a permitir hacer consultas a la base de datos como:
//• prisma.user.findUnique(...)
//• prisma.user.create(...)
//• prisma.producto.findMany(...)
//• prisma.producto.create(...)
//• prisma.pedido.findMany(...)
//basicamente va a estar transformando nuestras solicitudes a la base de datos, en codigo sql
//que entiende la base de datos
const prisma = new PrismaClient();


//exportamos esa instancia para que otros archivos puedan usarla
module.exports = { prisma };
