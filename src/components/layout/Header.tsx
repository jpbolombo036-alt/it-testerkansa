import { Link } from 'react-router-dom'

function Header() {
  return (
    <header style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>
      <nav>
        <Link to="/">Dashboard</Link> | <Link to="/users">Utilisateurs</Link> |{' '}
        <Link to="/comptes">Comptes</Link>
      </nav>
    </header>
  )
}

export default Header
