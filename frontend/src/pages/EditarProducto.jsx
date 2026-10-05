import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import SiteHeader from '../components/SiteHeader'
import { getApiError } from '../api/products'
import { useProducts, useUpdateProduct } from '../hooks/useProducts'
import { productSchema } from '../utils/validation'

export default function EditarProducto() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [imagen, setImagen] = useState(null)
  const [serverError, setServerError] = useState('')
  const { data: productos = [], isPending, isError } = useProducts()
  const updateProduct = useUpdateProduct()
  const producto = productos.find((item) => String(item.id) === String(id))
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: { nombre: '', descripcion: '', precio: '', stock: '' },
  })

  useEffect(() => {
    if (!producto) return
    reset({
      nombre: producto.nombre || '',
      descripcion: producto.descripcion || '',
      precio: String(producto.precio ?? ''),
      stock: String(producto.stock ?? ''),
    })
  }, [producto, reset])

  const handleSave = async (values) => {
    setServerError('')

    try {
      const formData = new FormData()
      formData.append('nombre', values.nombre)
      formData.append('descripcion', values.descripcion || '')
      formData.append('precio', values.precio)
      formData.append('stock', values.stock)

      if (imagen) {
        formData.append('imagen', imagen)
      }

      await updateProduct.mutateAsync({ id, formData })
      navigate('/dashboard')
    } catch (error) {
      setServerError(getApiError(error, 'No se pudo actualizar el producto.'))
    }
  }

  return (
    <div className="pagina-tiempo-real dashboard-page">
      <SiteHeader />

      <div className="dashboard-shell edit-shell">
        <div className="dashboard-panel">
          <h2>Editar producto</h2>
          {isPending && <p>Cargando producto...</p>}
          {isError && <p role="alert">No se pudo cargar el producto.</p>}
          {!isPending && !isError && !producto && <p>No se encontró el producto.</p>}
          <form onSubmit={handleSubmit(handleSave)} className="dashboard-form dashboard-form-edit" noValidate>
            <input {...register('nombre')} placeholder="Nombre" />
            {errors.nombre && <small role="alert">{errors.nombre.message}</small>}
            <input {...register('descripcion')} placeholder="Descripción" />
            <input {...register('precio')} type="number" step="0.01" placeholder="Precio" />
            {errors.precio && <small role="alert">{errors.precio.message}</small>}
            <input {...register('stock')} type="number" step="1" placeholder="Stock" />
            {errors.stock && <small role="alert">{errors.stock.message}</small>}
            <label className="file-upload">
              <span>Seleccionar imagen nueva</span>
              <input type="file" accept="image/*" onChange={(event) => setImagen(event.target.files[0] || null)} />
            </label>
            {serverError && <p role="alert">{serverError}</p>}
            <div className="dashboard-actions edit-buttons">
              <button type="submit" disabled={updateProduct.isPending}>{updateProduct.isPending ? 'Guardando...' : 'Guardar cambios'}</button>
              <button type="button" className="dashboard-delete" onClick={() => navigate('/dashboard')}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
