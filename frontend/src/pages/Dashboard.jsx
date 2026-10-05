import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import SiteHeader from '../components/SiteHeader'
import { getApiError } from '../api/products'
import { useCreateProduct, useDeleteProduct, useProducts } from '../hooks/useProducts'
import { useAuth } from '../hooks/useAuth'
import { productSchema } from '../utils/validation'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [imagen, setImagen] = useState(null)
  const [serverError, setServerError] = useState('')
  const fileInput = useRef(null)
  const { data: productos = [], isPending, isError } = useProducts()
  const createProduct = useCreateProduct()
  const deleteProduct = useDeleteProduct()
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: { nombre: '', descripcion: '', precio: '', stock: '' },
  })

  const handleSubmitProduct = async (values) => {
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

      await createProduct.mutateAsync(formData)
      reset()
      setImagen(null)
      if (fileInput.current) fileInput.current.value = ''
    } catch (error) {
      setServerError(getApiError(error, 'No se pudo guardar el producto.'))
    }
  }

  const handleDelete = async (id) => {
    try {
      setServerError('')
      await deleteProduct.mutateAsync(id)
    } catch (error) {
      setServerError(getApiError(error, 'No se pudo eliminar el producto.'))
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="pagina-tiempo-real dashboard-page">
      <SiteHeader />

      <div className="dashboard-shell">
        <div className="dashboard-topbar">
          <div>
            <strong>Mi dashboard</strong>
          </div>
          <div className="dashboard-user-row">
            <span>Bienvenido, {user?.username}</span>
            <button type="button" className="dashboard-logout" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </div>

        <section className="dashboard-panel">
          <h2>Agregar producto</h2>
          <form onSubmit={handleSubmit(handleSubmitProduct)} className="dashboard-form" noValidate>
            <input {...register('nombre')} placeholder="Nombre" />
            {errors.nombre && <small role="alert">{errors.nombre.message}</small>}
            <input {...register('descripcion')} placeholder="Descripción" />
            <input {...register('precio')} type="number" step="0.01" placeholder="Precio" />
            {errors.precio && <small role="alert">{errors.precio.message}</small>}
            <input {...register('stock')} type="number" step="1" placeholder="Stock" />
            {errors.stock && <small role="alert">{errors.stock.message}</small>}
            <label className="file-upload">
              <span>Seleccionar archivo</span>
              <input ref={fileInput} type="file" accept="image/*" onChange={(e) => setImagen(e.target.files[0] || null)} />
            </label>
            <button type="submit" disabled={createProduct.isPending}>{createProduct.isPending ? 'Guardando...' : 'Guardar'}</button>
          </form>
          {serverError && <p role="alert">{serverError}</p>}
        </section>

        <section className="dashboard-products">
          <h2>Productos</h2>
          {isPending && <p>Cargando productos...</p>}
          {isError && <p role="alert">No se pudieron cargar los productos.</p>}
          <div className="dashboard-grid">
            {productos.map((producto) => (
              <article key={producto.id} className="dashboard-card">
                <h3>{producto.nombre}</h3>
                <p className="muted">{producto.descripcion || 'Sin descripción'}</p>
                <p><strong>Precio:</strong> ${Number(producto.precio).toFixed(2)}</p>
                <p><strong>Stock:</strong> {producto.stock}</p>
                <div className="dashboard-actions">
                  <button type="button" className="dashboard-edit" onClick={() => navigate(`/editar/${producto.id}`)}>Editar</button>
                  <button type="button" className="dashboard-delete" onClick={() => handleDelete(producto.id)} disabled={deleteProduct.isPending}>Eliminar</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
