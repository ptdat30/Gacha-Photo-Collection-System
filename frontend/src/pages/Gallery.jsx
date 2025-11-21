import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import './Gallery.css'
import '../styles/CardFrames.css'

function Gallery() {
  const { user, token } = useAuth()
  const [photos, setPhotos] = useState([])
  const [userInventory, setUserInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  useEffect(() => {
    fetchPhotos()
    if (user) {
      fetchUserInventory()
    }
  }, [user])

  useEffect(() => {
    // Listen for inventory updates from gacha
    const handleInventoryUpdate = () => {
      if (user) {
        fetchUserInventory()
      }
    }
    
    window.addEventListener('inventoryUpdated', handleInventoryUpdate)
    return () => {
      window.removeEventListener('inventoryUpdated', handleInventoryUpdate)
    }
  }, [user])

  const fetchPhotos = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/photos/active')
      setPhotos(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching photos:', error)
      setLoading(false)
    }
  }

  const fetchUserInventory = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/inventory/user/${user.userId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      setUserInventory(response.data)
    } catch (error) {
      console.error('Error fetching inventory:', error)
    }
  }

  const hasPhoto = (photoId) => {
    if (!user) return false // Nếu chưa đăng nhập, không có ảnh nào
    return userInventory.some(item => item.photo?.photoId === photoId)
  }

  const getPhotoQuantity = (photoId) => {
    const item = userInventory.find(item => item.photo?.photoId === photoId)
    return item?.quantity || 0
  }

  const getRarityColor = (rarity) => {
    const colors = {
      'N': '#808080',
      'C': '#4caf50',
      'R': '#2196f3',
      'SR': '#9c27b0',
      'SSR': '#ff9800',
      'UR': '#f44336',
      'L': '#ffd700',
      'X': '#212121'
    }
    return colors[rarity] || '#ffffff'
  }

  const getRarityFrameClass = (rarity) => {
    const frameClasses = {
      'N': 'frame-n',      // Nháp - Đen Trắng
      'C': 'frame-c',      // Thường - Neon Tĩnh
      'R': 'frame-r',      // Hiếm - Kim Loại Quét
      'SR': 'frame-sr',    // Siêu Hiếm - Vàng Hô Hấp
      'SSR': 'frame-ssr',  // Squad - Dòng Chảy Gradient
      'UR': 'frame-ur',    // Cực Phẩm - RGB Gamer
      'L': 'frame-l',      // Huyền Thoại - Lỗi Kỹ Thuật
      'X': 'frame-x'       // Bí Mật - Kính Cường Lực
    }
    return frameClasses[rarity] || ''
  }

  if (loading) {
    return <div className="gallery-loading">Đang tải...</div>
  }

  return (
    <div className="gallery">
      <h1>📸 Album Kỷ niệm</h1>
      <p className="gallery-description">
        {user 
          ? 'Xem toàn bộ ảnh kỷ niệm của lớp. Ảnh bạn chưa sở hữu sẽ bị làm mờ.'
          : 'Đăng nhập để xem ảnh rõ nét. Ảnh sẽ bị làm mờ khi chưa đăng nhập.'
        }
      </p>
      <div className="photo-grid">
        {photos.map((photo) => {
          const owned = hasPhoto(photo.photoId)
          const quantity = getPhotoQuantity(photo.photoId)
          
          return (
            <div 
              key={photo.photoId} 
              className={`photo-card ${owned ? 'owned' : 'locked'} ${getRarityFrameClass(photo.rarity)}`}
              onClick={() => {
                if (owned) {
                  setSelectedPhoto(photo)
                }
              }}
            >
              <div 
                className="photo-rarity"
                style={{ backgroundColor: getRarityColor(photo.rarity) }}
              >
                {photo.rarity}
              </div>
              {quantity > 0 && (
                <div className="quantity-indicator">x{quantity}</div>
              )}
              <div className="photo-image-wrapper">
                <img 
                  src={photo.imageUrl} 
                  alt={`Photo ${photo.photoId}`}
                  className={`photo-image ${owned ? '' : 'locked-image'}`}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200?text=No+Image'
                  }}
                />
              </div>
              {!owned && (
                <div className="locked-overlay">
                  <span className="lock-icon">🔒</span>
                  <p>Chưa sở hữu</p>
                </div>
              )}
              <div className="photo-info">
                <p>ID: {photo.photoId}</p>
                <p>Rarity: {photo.rarity}</p>
                {photo.collection && (
                  <p className="collection-name">📁 {photo.collection.name}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Photo View Modal */}
      {selectedPhoto && (
        <div className="photo-modal-overlay" onClick={() => setSelectedPhoto(null)}>
          <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="photo-modal-close" onClick={() => setSelectedPhoto(null)}>×</button>
            
            <div className="photo-modal-image-container">
              <img 
                src={selectedPhoto.imageUrl} 
                alt={`Photo ${selectedPhoto.photoId}`}
                className="photo-modal-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800?text=No+Image'
                }}
              />
            </div>
            
            <div className="photo-modal-info">
              <div className="photo-modal-header">
                <div 
                  className="photo-modal-rarity"
                  style={{ backgroundColor: getRarityColor(selectedPhoto.rarity) }}
                >
                  {selectedPhoto.rarity}
                </div>
                {getPhotoQuantity(selectedPhoto.photoId) > 0 && (
                  <div className="photo-modal-quantity">
                    Số lượng: x{getPhotoQuantity(selectedPhoto.photoId)}
                  </div>
                )}
              </div>
              
              <div className="photo-modal-details">
                <p><strong>ID:</strong> {selectedPhoto.photoId}</p>
                {selectedPhoto.collection && (
                  <p><strong>Bộ sưu tập:</strong> 📁 {selectedPhoto.collection.name}</p>
                )}
                {selectedPhoto.collection?.description && (
                  <p><strong>Mô tả:</strong> {selectedPhoto.collection.description}</p>
                )}
                <p><strong>Trạng thái:</strong> {selectedPhoto.status}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Gallery

