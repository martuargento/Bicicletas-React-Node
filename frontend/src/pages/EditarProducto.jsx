import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Encabezado from '../components/Encabezado'
import { obtenerErrorApi, obtenerProductos, actualizarProducto } from '../api/products'

const emptyForm = { nombre: '', descripcion: '', precio: '', stock: '' }

export default function EditarProducto() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [imagen, setImagen] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [found, setFound] = useState(true)

  useEffect(() => {
    let active = true

    const cargarProducto = async () => {
      try {
        const productos = await obtenerProductos()
        const producto = productos.find((item) => String(item.id) === String(id))
        if (!active) return

        if (producto) {
          setForm({
            nombre: producto.nombre || '',
            descripcion: producto.descripcion || '',
            precio: String(producto.precio ?? ''),
            stock: String(producto.stock ?? ''),
          })
        } else {
          setFound(false)
        }
      } catch (requestError) {
        if (active) setError(obtenerErrorApi(requestError, 'No se pudo cargar el producto.'))
      } finally {
        if (active) setLoading(false)
      }
    }

    cargarProducto()
    return () => { active = false }
  }, [id])

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setError('')
    setSaving(true)

    try {
      const formData = new FormData()
      Object.entries(form).forEach(([name, value]) => formData.append(name, value))

      if (imagen) {
        formData.append('imagen', imagen)
      }

      await actualizarProducto({ id, formData })
      navigate('/dashboard')
    } catch (requestError) {
      setError(obtenerErrorApi(requestError, 'No se pudo actualizar el producto.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pagina-tiempo-real dashboard-page">
      <Encabezado />

      <div className="dashboard-shell edit-shell">
        <div className="dashboard-panel">
          <h2>Editar producto</h2>
          {loading && <p>Cargando producto...</p>}
          {!loading && !found && <p>No se encontró el producto.</p>}
          <form onSubmit={handleSave} className="dashboard-form dashboard-form-edit">
            <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" required />
            <input name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción" />
            <input name="precio" type="number" min="0" step="0.01" value={form.precio} onChange={handleChange} placeholder="Precio" required />
            <input name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} placeholder="Stock" required />
            <label className="file-upload">
              <span>Seleccionar imagen nueva</span>
              <input type="file" accept="image/*" onChange={(event) => setImagen(event.target.files[0] || null)} />
            </label>
            {error && <p role="alert">{error}</p>}
            <div className="dashboard-actions edit-buttons">
              <button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
              <button type="button" className="dashboard-delete" onClick={() => navigate('/dashboard')}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
