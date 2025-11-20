import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './AuthModal.css'

function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'MEMBER'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, register } = useAuth()

  if (!isOpen) return null

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let result
      if (isLogin) {
        result = await login(formData.username || formData.email, formData.password)
      } else {
        result = await register(formData)
      }

      if (result.success) {
        onClose()
        setFormData({
          username: '',
          email: '',
          password: '',
          fullName: '',
          role: 'MEMBER'
        })
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: 'MEMBER'
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="auth-header">
          <h1>🎴 Memories Gacha</h1>
          <h2>{isLogin ? 'Đăng nhập' : 'Đăng ký'}</h2>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>Họ và tên</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nhập họ và tên"
              />
            </div>
          )}

          <div className="form-group">
            <label>{isLogin ? 'Username hoặc Email' : 'Username'}</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder={isLogin ? "Username hoặc email" : "Nhập username"}
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Nhập email"
              />
            </div>
          )}

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Vai trò (Role)</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="MEMBER">MEMBER - Thành viên</option>
                <option value="CONTENT_ADMIN">CONTENT_ADMIN - Quản trị nội dung</option>
                <option value="SYSTEM_ADMIN">SYSTEM_ADMIN - Quản trị hệ thống</option>
              </select>
            </div>
          )}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký')}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? (
            <p>
              Chưa có tài khoản?{' '}
              <button type="button" className="link-button" onClick={switchMode}>
                Đăng ký ngay
              </button>
            </p>
          ) : (
            <p>
              Đã có tài khoản?{' '}
              <button type="button" className="link-button" onClick={switchMode}>
                Đăng nhập
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthModal

