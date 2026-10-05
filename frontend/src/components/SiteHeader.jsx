import { Link } from 'react-router-dom'

export default function SiteHeader({ activePage, children }) {
  return (
    <header className="site-header">
      <div id="logo">
        <Link to="/">
          <img src="/Logoheader.jpg" alt="Logo Bicileal" />
        </Link>
      </div>

      <div className="secciones">
        <ul>
          <li className={activePage === 'products' ? 'active' : ''}><Link to="/">Productos</Link></li>
          <li className={activePage === 'story' ? 'active' : ''}><Link to="/nuestra-historia">Nuestra historia</Link></li>
          <li className={activePage === 'contact' ? 'active' : ''}><Link to="/contactanos">Contáctenos</Link></li>
        </ul>
      </div>

      <div className="redes-principal">
        <a href="https://www.instagram.com" target="_blank" rel="noreferrer"><img src="/icons/instagram.svg" alt="Instagram" /></a>
        <a href="https://www.facebook.com" target="_blank" rel="noreferrer"><img src="/icons/facebook.svg" alt="Facebook" /></a>
      </div>
      {children}
    </header>
  )
}