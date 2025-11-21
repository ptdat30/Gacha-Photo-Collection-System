import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import './Marketplace.css'
import '../styles/CardFrames.css'

function Marketplace() {
  const { user, token, updateUser } = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [userInventory, setUserInventory] = useState([])
  const [selectedInventory, setSelectedInventory] = useState(null)
  const [price, setPrice] = useState('')
  const [message, setMessage] = useState('')
  const [durationHours, setDurationHours] = useState(24)
  const [suggestedPrice, setSuggestedPrice] = useState({ min: 0, max: 0 })
  
  // Filters
  const [filterRarity, setFilterRarity] = useState('')
  const [filterCollection, setFilterCollection] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [collections, setCollections] = useState([])

  useEffect(() => {
    if (user) {
      fetchListings()
      fetchUserInventory()
      fetchCollections()
    }
  }, [user, filterRarity, filterCollection, sortBy, minPrice, maxPrice])

  const fetchListings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterRarity) params.append('rarity', filterRarity)
      if (filterCollection) params.append('collectionId', filterCollection)
      if (sortBy) params.append('sortBy', sortBy)
      if (minPrice) params.append('minPrice', minPrice)
      if (maxPrice) params.append('maxPrice', maxPrice)
      
      const response = await axios.get(
        `http://localhost:8080/api/marketplace/browse?${params.toString()}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      setListings(response.data)
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserInventory = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/inventory/user/${user.userId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      setUserInventory(response.data)
    } catch (error) {
      console.error('Error fetching inventory:', error)
    }
  }

  const fetchCollections = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/collections')
      setCollections(response.data)
    } catch (error) {
      console.error('Error fetching collections:', error)
    }
  }

  const handleSelectInventory = async (inventory) => {
    setSelectedInventory(inventory)
    if (inventory.photo?.rarity) {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/marketplace/suggested-price/${inventory.photo.rarity}`
        )
        setSuggestedPrice(response.data)
        setPrice(response.data.minPrice.toString())
      } catch (error) {
        console.error('Error fetching suggested price:', error)
      }
    }
  }

  const handleCreateListing = async () => {
    if (!selectedInventory || !price) {
      alert('Vui lòng chọn ảnh và nhập giá')
      return
    }

    try {
      const response = await axios.post(
        'http://localhost:8080/api/marketplace/create-listing',
        {
          inventoryId: selectedInventory.inventoryId,
          priceCoins: parseInt(price),
          message: message,
          durationHours: durationHours
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-Id': user.userId
          }
        }
      )
      
      alert('Đăng bán thành công!')
      setShowCreateModal(false)
      setSelectedInventory(null)
      setPrice('')
      setMessage('')
      fetchListings()
      fetchUserInventory()
    } catch (error) {
      alert(error.response?.data?.error || 'Có lỗi xảy ra')
    }
  }

  const handleBuy = async (listingId) => {
    if (!confirm('Bạn có chắc muốn mua ảnh này?')) return

    try {
      const response = await axios.post(
        `http://localhost:8080/api/marketplace/buy/${listingId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-Id': user.userId
          }
        }
      )
      
      // Fetch lại user để cập nhật coin balance
      const userResponse = await axios.get(
        `http://localhost:8080/api/users/${user.userId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      if (updateUser && userResponse.data) {
        updateUser({
          ...user,
          coinBalance: userResponse.data.coinBalance
        })
      }
      
      alert('Mua thành công!')
      fetchListings()
      window.dispatchEvent(new CustomEvent('inventoryUpdated'))
    } catch (error) {
      alert(error.response?.data?.error || 'Có lỗi xảy ra')
    }
  }

  const handleDelist = async (listingId) => {
    if (!confirm('Bạn có chắc muốn gỡ niêm yết ảnh này? ')) return

    try {
      const response = await axios.post(
        `http://localhost:8080/api/marketplace/delist/${listingId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-Id': user.userId
          }
        }
      )
      
      alert('Đã gỡ niêm yết thành công!')
      fetchListings()
      window.dispatchEvent(new CustomEvent('inventoryUpdated'))
    } catch (error) {
      console.error('Error delisting:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Có lỗi xảy ra'
      alert(`Lỗi: ${errorMessage}`)
    }
  }

  const getRarityColor = (rarity) => {
    const colors = {
      'N': '#808080', 'C': '#4caf50', 'R': '#2196f3', 'SR': '#9c27b0',
      'SSR': '#ff9800', 'UR': '#f44336', 'L': '#ffd700', 'X': '#212121'
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

  const formatTimeRemaining = (expiresAt) => {
    if (!expiresAt) return 'Không xác định'
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires - now
    
    if (diff <= 0) return 'Đã hết hạn'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  if (!user) {
    return (
      <div className="marketplace">
        <h1>🛒 Căng Tin Chợ Đen</h1>
        <p>Vui lòng đăng nhập để sử dụng chợ</p>
      </div>
    )
  }

  return (
    <div className="marketplace">
      <div className="marketplace-header">
        <h1>🛒 Căng Tin Chợ Đen</h1>
        <button 
          className="create-listing-btn"
          onClick={() => setShowCreateModal(true)}
        >
          ➕ Đăng bán
        </button>
      </div>

      {/* Filters */}
      <div className="marketplace-filters">
        <div className="filter-group">
          <label>Độ hiếm:</label>
          <select value={filterRarity} onChange={(e) => setFilterRarity(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="N">N</option>
            <option value="C">C</option>
            <option value="R">R</option>
            <option value="SR">SR</option>
            <option value="SSR">SSR</option>
            <option value="UR">UR</option>
            <option value="L">L</option>
            <option value="X">X</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Bộ sưu tập:</label>
          <select value={filterCollection} onChange={(e) => setFilterCollection(e.target.value)}>
            <option value="">Tất cả</option>
            {collections.map(col => (
              <option key={col.collectionId} value={col.collectionId}>
                {col.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Sắp xếp:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá: Thấp → Cao</option>
            <option value="price_desc">Giá: Cao → Thấp</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Giá từ:</label>
          <input 
            type="number" 
            placeholder="Min" 
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>đến:</label>
          <input 
            type="number" 
            placeholder="Max" 
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : listings.length === 0 ? (
        <div className="empty-marketplace">
          <p>Chưa có ảnh nào được đăng bán</p>
        </div>
      ) : (
        <div className="listings-grid">
          {listings.map(listing => (
            <div 
              key={listing.listingId} 
              className={`listing-card ${getRarityFrameClass(listing.photo?.rarity)}`}
            >
              <div className="listing-image-wrapper">
                <img 
                  src={listing.photo?.imageUrl} 
                  alt={`Photo ${listing.photo?.photoId}`}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200?text=No+Image'
                  }}
                />
                <div 
                  className="listing-rarity-badge"
                  style={{ backgroundColor: getRarityColor(listing.photo?.rarity) }}
                >
                  {listing.photo?.rarity}
                </div>
                {listing.expiresAt && (
                  <div className="listing-expires">
                    ⏰ {formatTimeRemaining(listing.expiresAt)}
                  </div>
                )}
              </div>
              
              <div className="listing-info">
                <div className="listing-price">
                  💰 {listing.priceCoins.toLocaleString()} coin
                </div>
                {listing.message && (
                  <p className="listing-message">"{listing.message}"</p>
                )}
                <p className="listing-seller">
                  👤 {listing.seller?.username}
                </p>
                {listing.photo?.collection && (
                  <p className="listing-collection">
                    📁 {listing.photo.collection.name}
                  </p>
                )}
              </div>

              <div className="listing-actions">
                <button 
                  className="buy-btn"
                  onClick={() => handleBuy(listing.listingId)}
                >
                  🛒 Mua ngay
                </button>
                <button 
                  className="delist-btn"
                  onClick={() => handleDelist(listing.listingId)}
                  title="Gỡ niêm yết "
                >
                  🔒 Gỡ 
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Listing Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Đăng bán ảnh</h2>
            
            <div className="modal-section">
              <label>Chọn ảnh từ kho:</label>
              <div className="inventory-selector">
                {userInventory
                  .filter(inv => (inv.quantity || 1) > 0)
                  .map(inv => (
                    <div 
                      key={inv.inventoryId}
                      className={`inventory-item-select ${selectedInventory?.inventoryId === inv.inventoryId ? 'selected' : ''}`}
                      onClick={() => handleSelectInventory(inv)}
                    >
                      <img src={inv.photo?.imageUrl} alt={`Photo ${inv.photo?.photoId}`} />
                      <div className="inventory-item-rarity" style={{ backgroundColor: getRarityColor(inv.photo?.rarity) }}>
                        {inv.photo?.rarity}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {selectedInventory && (
              <>
                <div className="modal-section">
                  <label>Giá bán (Coin):</label>
                  <div className="price-suggestion">
                    <span>Gợi ý: {suggestedPrice.min} - {suggestedPrice.max} coin</span>
                  </div>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min={suggestedPrice.min}
                    max={suggestedPrice.max}
                    placeholder="Nhập giá bán"
                  />
                </div>

                <div className="modal-section">
                  <label>Lời nhắn (tùy chọn):</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ví dụ: Ảnh này thằng Tùng ngủ chảy ke, hàng hiếm nha anh em"
                    rows="3"
                  />
                </div>

                <div className="modal-section">
                  <label>Thời hạn:</label>
                  <select value={durationHours} onChange={(e) => setDurationHours(parseInt(e.target.value))}>
                    <option value={24}>24 giờ</option>
                    <option value={48}>48 giờ</option>
                  </select>
                </div>

                <div className="modal-actions">
                  <button onClick={() => setShowCreateModal(false)}>Hủy</button>
                  <button onClick={handleCreateListing} className="primary">Đăng bán</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Marketplace

