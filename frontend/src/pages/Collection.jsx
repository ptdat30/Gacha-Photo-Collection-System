import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import './Collection.css'

function Collection() {
  const { user, token } = useAuth()
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPhotos: 0,
    totalQuantity: 0,
    byRarity: {}
  })

  useEffect(() => {
    if (user) {
      fetchInventory()
    } else {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    // Listen for inventory updates from gacha
    const handleInventoryUpdate = () => {
      if (user) {
        fetchInventory()
      }
    }
    
    window.addEventListener('inventoryUpdated', handleInventoryUpdate)
    return () => {
      window.removeEventListener('inventoryUpdated', handleInventoryUpdate)
    }
  }, [user])

  const fetchInventory = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/inventory/user/${user.userId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      setInventory(response.data)
      calculateStats(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching inventory:', error)
      setLoading(false)
    }
  }

  const calculateStats = (inventoryData) => {
    const stats = {
      totalPhotos: inventoryData.length,
      totalQuantity: 0,
      byRarity: {}
    }

    inventoryData.forEach(item => {
      stats.totalQuantity += item.quantity || 1
      const rarity = item.photo?.rarity || 'UNKNOWN'
      stats.byRarity[rarity] = (stats.byRarity[rarity] || 0) + (item.quantity || 1)
    })

    setStats(stats)
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

  if (!user) {
    return (
      <div className="collection">
        <h1>📚 Bộ sưu tập cá nhân</h1>
        <p>Vui lòng đăng nhập để xem bộ sưu tập của bạn</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="collection">
        <div className="loading">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="collection">
      <h1>📚 Bộ sưu tập cá nhân</h1>
      
      <div className="collection-stats">
        <div className="stat-card">
          <h3>Tổng số ảnh</h3>
          <p className="stat-number">{stats.totalPhotos}</p>
        </div>
        <div className="stat-card">
          <h3>Tổng số thẻ</h3>
          <p className="stat-number">{stats.totalQuantity}</p>
        </div>
        <div className="stat-card">
          <h3>Theo độ hiếm</h3>
          <div className="rarity-stats">
            {Object.entries(stats.byRarity).map(([rarity, count]) => (
              <span 
                key={rarity} 
                className="rarity-stat-badge"
                style={{ backgroundColor: getRarityColor(rarity) }}
              >
                {rarity}: {count}
              </span>
            ))}
          </div>
        </div>
      </div>

      {inventory.length === 0 ? (
        <div className="empty-collection">
          <p>Bạn chưa có ảnh nào trong bộ sưu tập.</p>
          <p>Hãy quay gacha để bắt đầu sưu tập!</p>
        </div>
      ) : (
        <div className="inventory-grid">
          {inventory.map((item) => (
            <div key={item.inventoryId} className="inventory-card">
              <div className="photo-wrapper">
                <img 
                  src={item.photo?.imageUrl} 
                  alt={`Photo ${item.photo?.photoId}`}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200?text=No+Image'
                  }}
                />
                <div 
                  className="rarity-badge"
                  style={{ backgroundColor: getRarityColor(item.photo?.rarity) }}
                >
                  {item.photo?.rarity}
                </div>
                {item.quantity > 1 && (
                  <div className="quantity-badge">
                    x{item.quantity}
                  </div>
                )}
                {item.isFavorite && (
                  <div className="favorite-badge">❤️</div>
                )}
              </div>
              <div className="inventory-info">
                <p className="photo-id">ID: {item.photo?.photoId}</p>
                {item.photo?.collection && (
                  <p className="collection-name">
                    📁 {item.photo.collection.name}
                  </p>
                )}
                <p className="obtained-date">
                  Nhận được: {new Date(item.obtainedAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Collection

