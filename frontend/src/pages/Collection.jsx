import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import './Collection.css'
import '../styles/CardFrames.css'

function Collection() {
  const { user, token, updateUser } = useAuth()
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPhotos: 0,
    totalQuantity: 0,
    byRarity: {}
  })
  const [sellingItem, setSellingItem] = useState(null)
  const [showSellModal, setShowSellModal] = useState(false)
  const [sellQuantity, setSellQuantity] = useState(1)
  const [selling, setSelling] = useState(false)

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

  const getSellPrice = (rarity) => {
    const prices = {
      'N': 5,
      'C': 10,
      'R': 25,
      'SR': 50,
      'SSR': 100,
      'UR': 200,
      'L': 500,
      'X': 1000
    }
    return prices[rarity] || 10
  }

  const handleSellClick = (item) => {
    if (item.quantity <= 1) return
    setSellingItem(item)
    setSellQuantity(1)
    setShowSellModal(true)
  }

  const handleSellConfirm = async () => {
    if (!sellingItem || sellQuantity <= 0) return
    
    setSelling(true)
    try {
      const response = await axios.post(
        `http://localhost:8080/api/inventory/sell/${user.userId}/${sellingItem.inventoryId}`,
        { quantity: sellQuantity },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      
      // Fetch lại user data để cập nhật coin balance
      try {
        const userResponse = await axios.get(
          `http://localhost:8080/api/users/${user.userId}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        )
        if (updateUser && userResponse.data) {
          updateUser({
            ...user,
            coinBalance: userResponse.data.coinBalance,
            ticketBalance: userResponse.data.ticketBalance
          })
        }
      } catch (userError) {
        console.error('Error fetching user data:', userError)
        // Fallback: cập nhật coin balance từ response nếu có
        if (updateUser && response.data.newCoinBalance !== undefined) {
          updateUser({ ...user, coinBalance: response.data.newCoinBalance })
        }
      }
      
      // Refresh inventory
      await fetchInventory()
      
      alert(`Đã bán ${response.data.quantitySold} thẻ và nhận được ${response.data.coinsReceived} coin!`)
      setShowSellModal(false)
      setSellingItem(null)
    } catch (error) {
      console.error('Error selling cards:', error)
      alert(error.response?.data?.error || 'Có lỗi xảy ra khi bán thẻ')
    } finally {
      setSelling(false)
    }
  }

  const handleSellAll = async () => {
    if (!confirm('Bạn có chắc muốn bán TẤT CẢ thẻ thừa? (Sẽ giữ lại 1 thẻ mỗi loại)')) {
      return
    }
    
    setSelling(true)
    try {
      const response = await axios.post(
        `http://localhost:8080/api/inventory/sell-all/${user.userId}`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      
      // Fetch lại user data để cập nhật coin balance
      try {
        const userResponse = await axios.get(
          `http://localhost:8080/api/users/${user.userId}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        )
        if (updateUser && userResponse.data) {
          updateUser({
            ...user,
            coinBalance: userResponse.data.coinBalance,
            ticketBalance: userResponse.data.ticketBalance
          })
        }
      } catch (userError) {
        console.error('Error fetching user data:', userError)
        // Fallback: cập nhật coin balance từ response nếu có
        if (updateUser && response.data.newCoinBalance !== undefined) {
          updateUser({ ...user, coinBalance: response.data.newCoinBalance })
        }
      }
      
      // Refresh inventory
      await fetchInventory()
      
      alert(`Đã bán ${response.data.totalQuantitySold} thẻ và nhận được ${response.data.totalCoinsReceived} coin!`)
    } catch (error) {
      console.error('Error selling all cards:', error)
      alert(error.response?.data?.error || 'Có lỗi xảy ra khi bán thẻ')
    } finally {
      setSelling(false)
    }
  }

  const getExcessCount = () => {
    return inventory.reduce((total, item) => {
      const excess = (item.quantity || 1) - 1
      return total + (excess > 0 ? excess : 0)
    }, 0)
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
      
      {getExcessCount() > 0 && (
        <div className="sell-all-section">
          <div className="sell-all-info">
            <p>Bạn có <strong>{getExcessCount()}</strong> thẻ thừa có thể bán</p>
            <p className="sell-all-hint">Bán tất cả thẻ thừa để nhận coin!</p>
          </div>
          <button 
            className="sell-all-btn" 
            onClick={handleSellAll}
            disabled={selling}
          >
            {selling ? 'Đang xử lý...' : '💰 Bán tất cả thẻ thừa'}
          </button>
        </div>
      )}
      
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
            <div 
              key={item.inventoryId} 
              className={`inventory-card ${getRarityFrameClass(item.photo?.rarity)}`}
            >
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
                {item.quantity > 1 && (
                  <div className="sell-section">
                    <p className="excess-info">
                      Thẻ thừa: <strong>{item.quantity - 1}</strong> 
                      (Giá: <strong>{getSellPrice(item.photo?.rarity)} coin/thẻ</strong>)
                    </p>
                    <button 
                      className="sell-btn"
                      onClick={() => handleSellClick(item)}
                    >
                      💰 Bán thẻ thừa
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sell Modal */}
      {showSellModal && sellingItem && (
        <div className="sell-modal-overlay" onClick={() => !selling && setShowSellModal(false)}>
          <div className="sell-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Bán thẻ thừa</h2>
            <div className="sell-modal-content">
              <div className="sell-item-preview">
                <img 
                  src={sellingItem.photo?.imageUrl} 
                  alt={`Photo ${sellingItem.photo?.photoId}`}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200?text=No+Image'
                  }}
                />
                <div className="sell-item-info">
                  <p><strong>Rarity:</strong> {sellingItem.photo?.rarity}</p>
                  <p><strong>Số lượng hiện có:</strong> {sellingItem.quantity}</p>
                  <p><strong>Giá bán:</strong> {getSellPrice(sellingItem.photo?.rarity)} coin/thẻ</p>
                </div>
              </div>
              
              <div className="sell-quantity-input">
                <label>
                  Số lượng muốn bán (tối đa {sellingItem.quantity - 1}):
                </label>
                <input
                  type="number"
                  min="1"
                  max={sellingItem.quantity - 1}
                  value={sellQuantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1
                    const max = sellingItem.quantity - 1
                    setSellQuantity(Math.min(Math.max(1, val), max))
                  }}
                  disabled={selling}
                />
                <p className="sell-total">
                  Tổng coin nhận được: <strong>{getSellPrice(sellingItem.photo?.rarity) * sellQuantity} coin</strong>
                </p>
              </div>
            </div>
            
            <div className="sell-modal-actions">
              <button 
                className="sell-cancel-btn"
                onClick={() => setShowSellModal(false)}
                disabled={selling}
              >
                Hủy
              </button>
              <button 
                className="sell-confirm-btn"
                onClick={handleSellConfirm}
                disabled={selling || sellQuantity <= 0}
              >
                {selling ? 'Đang xử lý...' : 'Xác nhận bán'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Collection

