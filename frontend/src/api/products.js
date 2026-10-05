import api from './client'

export async function getProducts() {
  const { data } = await api.get('/productos/')
  return data
}

export async function createProduct(formData) {
  const { data } = await api.post('/productos/crear/', formData)
  return data
}

export async function updateProduct({ id, formData }) {
  const { data } = await api.patch(`/productos/${id}/actualizar/`, formData)
  return data
}

export async function deleteProduct(id) {
  await api.delete(`/productos/${id}/eliminar/`)
}

export function getApiError(error, fallback) {
  const details = Object.values(error.response?.data?.details || {}).flat()
  return error.response?.data?.error || error.response?.data?.detail || details[0] || fallback
}