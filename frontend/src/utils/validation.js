import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'El usuario es obligatorio.'),
  password: z.string().min(1, 'La contraseña es obligatoria.'),
})

export const registerSchema = loginSchema.extend({
  email: z.string().trim().email('Ingresá un email válido.'),
})

const numberField = (label) => z.string()
  .trim()
  .min(1, `${label} es obligatorio.`)
  .refine((value) => Number.isFinite(Number(value)), `${label} debe ser un número válido.`)
  .transform(Number)
  .pipe(z.number().min(0, `${label} no puede ser negativo.`))

export const productSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio.'),
  descripcion: z.string(),
  precio: numberField('El precio'),
  stock: numberField('El stock').pipe(z.number().int('El stock debe ser un número entero.')),
})

export const contactSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio.'),
  apellido: z.string().trim().min(1, 'El apellido es obligatorio.'),
  email: z.string().trim().email('Ingresá un email válido.'),
  telefono: z.string().trim().min(8, 'Ingresá un teléfono válido.'),
  mensaje: z.string().trim().min(10, 'El mensaje debe tener al menos 10 caracteres.'),
})