import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'
import './Layout.css'

function Layout({ children }) {
  const location = useLocation()
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <h2>🎴 Memories Gacha</h2>
          </Link>
          <ul className="nav-menu">
            <li>
              <Link 
                to="/" 
                className={location.pathname === '/' ? 'active' : ''}
              >
                Trang chủ
              </Link>
            </li>
            <li>
              <Link 
                to="/gallery" 
                className={location.pathname === '/gallery' ? 'active' : ''}
              >
                Album
              </Link>
            </li>
            <li>
              <Link 
                to="/gacha" 
                className={location.pathname === '/gacha' ? 'active' : ''}
              >
                Quay Gacha
              </Link>
            </li>
            <li>
              <Link 
                to="/collection" 
                className={location.pathname === '/collection' ? 'active' : ''}
              >
                Bộ sưu tập
              </Link>
            </li>
            <li>
              <Link 
                to="/marketplace" 
                className={location.pathname === '/marketplace' ? 'active' : ''}
              >
                🛒 Chợ Đen
              </Link>
            </li>
            <li>
              <Link 
                to="/profile" 
                className={location.pathname === '/profile' ? 'active' : ''}
              >
                Hồ sơ
              </Link>
            </li>
            {(isAuthenticated && (user?.role === 'SYSTEM_ADMIN' || user?.role === 'CONTENT_ADMIN')) && (
              <li>
                <Link 
                  to="/admin" 
                  className={location.pathname === '/admin' ? 'active' : ''}
                >
                  Quản trị
                </Link>
              </li>
            )}
            {isAuthenticated ? (
              <li className="user-info">
                <span className="username">{user?.username}</span>
                <button onClick={handleLogout} className="logout-btn">
                  Đăng xuất
                </button>
              </li>
            ) : (
              <li>
                <button 
                  onClick={() => setIsAuthModalOpen(true)} 
                  className="auth-btn"
                >
                  Đăng nhập / Đăng ký
                </button>
              </li>
            )}
          </ul>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
      <footer className="footer">
        <p>&copy; 2024 Memories Gacha System - Hệ thống Sưu tầm Kỷ niệm Lớp học</p>
      </footer>
    </div>
  )
}

export default Layout

