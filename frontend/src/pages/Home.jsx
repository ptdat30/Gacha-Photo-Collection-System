import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthModal from '../components/AuthModal'
import './Home.css'

function Home() {
  const { isAuthenticated } = useAuth()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  return (
    <div className="home">
      <div className="hero">
        <h1>🎴 Memories Gacha System</h1>
        <p className="subtitle">Hệ thống Sưu tầm & Lưu trữ Kỷ niệm Lớp học</p>
        <p className="description">
          Thu thập những khoảnh khắc đáng nhớ của lớp học qua hệ thống Gacha độc đáo.
          Quay thưởng để sở hữu những bức ảnh kỷ niệm quý giá!
        </p>
        <div className="cta-buttons">
          {isAuthenticated ? (
            <>
              <Link to="/gacha" className="btn btn-primary">
                Bắt đầu Quay Gacha
              </Link>
              <Link to="/gallery" className="btn btn-secondary">
                Xem Album
              </Link>
            </>
          ) : (
            <>
              <button 
                className="btn btn-primary"
                onClick={() => setIsAuthModalOpen(true)}
              >
                Đăng nhập
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setIsAuthModalOpen(true)}
              >
                Đăng ký
              </button>
            </>
          )}
        </div>
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
      
      <div className="features">
        <h2>Tính năng nổi bật</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🎰</div>
            <h3>Hệ thống Gacha</h3>
            <p>Quay thưởng để nhận ảnh kỷ niệm với các độ hiếm khác nhau (C, R, SR, UR)</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📸</div>
            <h3>Album Kỷ niệm</h3>
            <p>Xem toàn bộ ảnh kỷ niệm của lớp, ảnh chưa có sẽ bị làm mờ</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Tương tác Xã hội</h3>
            <p>Like, comment, tag bạn bè vào những bức ảnh đáng nhớ</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛒</div>
            <h3>Chợ Giao dịch</h3>
            <p>Mua bán, trao đổi ảnh trùng lặp với bạn bè</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Nhiệm vụ Hàng ngày</h3>
            <p>Hoàn thành nhiệm vụ để kiếm vé quay Gacha</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Chuộc Ảnh</h3>
            <p>Sử dụng coin để ẩn những bức ảnh "dìm hàng" của mình</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home

