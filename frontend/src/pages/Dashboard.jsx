import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Encabezado from '../components/Encabezado'
import { crearProducto, eliminarProducto, obtenerErrorApi, obtenerProductos } from '../api/products'
import { useAuth } from '../hooks/useAuth'

const initialForm = { nombre: '', descripcion: '', precio: '', stock: '' }

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [productos, setProductos] = useState([])
  const [form, setForm] = useState(initialForm)
  const [imagen, setImagen] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const cargarProductos = async () => {
    setError('')
    try {
      setProductos(await obtenerProductos())
    } catch (requestError) {
      setError(obtenerErrorApi(requestError, 'No se pudieron cargar los productos.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarProductos()
  }, [])

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmitProduct = async (event) => {
    event.preventDefault()
    setError('')
    setSaving(true)

    try {
      const formData = new FormData()
      Object.entries(form).forEach(([name, value]) => formData.append(name, value))

      if (imagen) {
        formData.append('imagen', imagen)
      }

      await crearProducto(formData)
      setForm(initialForm)
      setImagen(null)
      event.currentTarget.reset()
      await cargarProductos()
    } catch (error) {
      setError(obtenerErrorApi(error, 'No se pudo guardar el producto.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      setError('')
      await eliminarProducto(id)
      await cargarProductos()
    } catch (error) {
      setError(obtenerErrorApi(error, 'No se pudo eliminar el producto.'))
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="pagina-tiempo-real dashboard-page">
      <Encabezado />

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
          <form onSubmit={handleSubmitProduct} className="dashboard-form">
            <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" required />
            <input name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción" />
            <input name="precio" type="number" min="0" step="0.01" value={form.precio} onChange={handleChange} placeholder="Precio" required />
            <input name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} placeholder="Stock" required />
            <label className="file-upload">
              <span>Seleccionar archivo</span>
              <input name="imagen" type="file" accept="image/*" onChange={(e) => setImagen(e.target.files[0] || null)} />
            </label>
            <button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
          </form>
          {error && <p role="alert">{error}</p>}
        </section>

        <section className="dashboard-products">
          <h2>Productos</h2>
          {loading && <p>Cargando productos...</p>}
          <div className="dashboard-grid">
            {productos.map((producto) => (
              <article key={producto.id} className="dashboard-card">
                <h3>{producto.nombre}</h3>
                <p className="muted">{producto.descripcion || 'Sin descripción'}</p>
                <p><strong>Precio:</strong> ${Number(producto.precio).toFixed(2)}</p>
                <p><strong>Stock:</strong> {producto.stock}</p>
                <div className="dashboard-actions">
                  <button type="button" className="dashboard-edit" onClick={() => navigate(`/editar/${producto.id}`)}>Editar</button>
                  <button type="button" className="dashboard-delete" onClick={() => handleDelete(producto.id)}>Eliminar</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
