import { Link } from 'react-router-dom'
import { useValorDolar } from '../hooks/useValorDolar'
import { useCarritoStore } from '../store/carritoStore'

export default function Carrito() {
  const carrito = useCarritoStore((estado) => estado.items)
  const quitarDelCarrito = useCarritoStore((estado) => estado.quitarDelCarrito)
  const vaciarCarrito = useCarritoStore((estado) => estado.vaciarCarrito)
  const cotizacion = useValorDolar()

  const totalAr = carrito.reduce((sum, item) => sum + Number(item.precio || 0) * Number(item.cantidad || 0), 0)
  const totalUsd = Math.round(totalAr / (cotizacion || 1))

  return (
    <div className="pagina-tiempo-real">
      <header className="site-header">
        <div id="logo">
          <Link to="/">
            <img src="/Logoheader.jpg" alt="Logo Bicileal" />
          </Link>
        </div>

        <div className="secciones">
          <ul>
            <li><Link to="/">Productos</Link></li>
            <li><Link to="/nuestra-historia">Nuestra historia</Link></li>
            <li><Link to="/contactanos">Contáctenos</Link></li>
          </ul>
        </div>

        <div className="redes-principal">
          <a href="https://www.instagram.com" target="_blank" rel="noreferrer"><img src="/icons/instagram.svg" alt="Instagram" /></a>
          <a href="https://www.facebook.com" target="_blank" rel="noreferrer"><img src="/icons/facebook.svg" alt="Facebook" /></a>
        </div>
      </header>

      <div className="page-shell">
        <div className="page-card carrito-page">
          <h1>Carrito</h1>

          {carrito.length === 0 ? (
            <>
              <p>Aún no agregaste productos.</p>
              <Link to="/" className="link-volver">Volver a la tienda</Link>
            </>
          ) : (
            <>
              <div className="carrito-lista">
                {carrito.map((item) => (
                  <div key={item.id} className="carrito-item">
                    <div>
                      <h3>{item.titulo}</h3>
                      <p>Cantidad: {item.cantidad}</p>
                    </div>
                    <div className="carrito-item-precio">
                      <span>$ {Number(item.precio * item.cantidad).toLocaleString('es-AR')}</span>
                      <span>USD {Math.round((item.precio * item.cantidad) / (cotizacion || 1))}</span>
                    </div>
                    <button type="button" className="quit-btn" onClick={() => quitarDelCarrito(item.id)}>Quitar</button>
                  </div>
                ))}
              </div>

              <div className="carrito-total-final">
                <h3>Total</h3>
                <p>$ {totalAr.toLocaleString('es-AR')}</p>
                <p>USD {totalUsd}</p>
              </div>

              <div className="carrito-actions">
                <button type="button" className="submit-btn" onClick={vaciarCarrito}>Vaciar carrito</button>
                <Link to="/" className="submit-btn secondary">Seguir comprando</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
