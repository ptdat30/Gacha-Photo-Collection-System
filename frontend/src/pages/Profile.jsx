import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import './Profile.css'

function Profile() {
  const { user, token, updateUser } = useAuth()
  const [userData, setUserData] = useState(null)
  const [titles, setTitles] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPulls: 0,
    totalPhotos: 0,
    totalSold: 0
  })

  useEffect(() => {
    if (user) {
      fetchUserData()
      fetchTitles()
      checkTitles()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/users/${user.userId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      setUserData(response.data)
      
      // Fetch stats
      const inventoryRes = await axios.get(
        `http://localhost:8080/api/inventory/user/${user.userId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      setStats(prev => ({
        ...prev,
        totalPhotos: inventoryRes.data.length
      }))
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching user data:', error)
      setLoading(false)
    }
  }

  const fetchTitles = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/titles/user/${user.userId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      setTitles(response.data)
    } catch (error) {
      console.error('Error fetching titles:', error)
    }
  }

  const checkTitles = async () => {
    try {
      await axios.post(
        `http://localhost:8080/api/titles/check/${user.userId}`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      // Refresh titles sau khi check
      setTimeout(() => {
        fetchTitles()
      }, 500)
    } catch (error) {
      console.error('Error checking titles:', error)
    }
  }

  const handleEquipTitle = async (titleId) => {
    try {
      await axios.post(
        `http://localhost:8080/api/titles/equip/${titleId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-Id': user.userId
          }
        }
      )
      fetchTitles()
      fetchUserData() // Refresh để cập nhật equipped title
    } catch (error) {
      alert(error.response?.data?.error || 'Có lỗi xảy ra')
    }
  }

  const handleUnequipTitle = async () => {
    try {
      await axios.post(
        'http://localhost:8080/api/titles/unequip',
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-Id': user.userId
          }
        }
      )
      fetchTitles()
      fetchUserData()
    } catch (error) {
      alert(error.response?.data?.error || 'Có lỗi xảy ra')
    }
  }

  const getRarityColor = (rarity) => {
    const colors = {
      'COMMON': '#4caf50',
      'RARE': '#2196f3',
      'EPIC': '#9c27b0',
      'LEGENDARY': '#ffd700'
    }
    return colors[rarity] || '#ffffff'
  }

  if (!user) {
    return (
      <div className="profile">
        <h1>👤 Hồ sơ</h1>
        <p>Vui lòng đăng nhập để xem hồ sơ</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="profile">
        <div className="loading">Đang tải...</div>
      </div>
    )
  }

  const equippedTitle = titles.find(t => t.isEquipped)

  return (
    <div className="profile">
      <h1>👤 Hồ sơ cá nhân</h1>

      <div className="profile-container">
        {/* User Info Card */}
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {userData?.avatarUrl ? (
                <img src={userData.avatarUrl} alt={userData.username} />
              ) : (
                <div className="avatar-placeholder">
                  {userData?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="profile-info">
              <h2>
                {userData?.username || user.username}
                {equippedTitle && (
                  <span 
                    className="equipped-title-badge"
                    style={{ 
                      backgroundColor: getRarityColor(equippedTitle.rarity),
                      marginLeft: '0.5rem'
                    }}
                  >
                    {equippedTitle.iconEmoji} {equippedTitle.titleName}
                  </span>
                )}
              </h2>
              <p className="profile-email">{userData?.email || user.email}</p>
              {userData?.fullName && (
                <p className="profile-fullname">{userData.fullName}</p>
              )}
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-label">Vé</span>
              <span className="stat-value">{userData?.ticketBalance || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Coin</span>
              <span className="stat-value">{userData?.coinBalance || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Ảnh</span>
              <span className="stat-value">{stats.totalPhotos}</span>
            </div>
          </div>
        </div>

        {/* Titles Section */}
        <div className="titles-section">
          <div className="section-header">
            <h2>🏆 Danh hiệu</h2>
            <button 
              className="check-titles-btn"
              onClick={checkTitles}
            >
              🔍 Kiểm tra danh hiệu
            </button>
          </div>

          {titles.length === 0 ? (
            <div className="empty-titles">
              <p>Bạn chưa có danh hiệu nào</p>
              <p className="hint">Hoàn thành các nhiệm vụ để mở khóa danh hiệu!</p>
            </div>
          ) : (
            <div className="titles-grid">
              {titles.map(title => (
                <div 
                  key={title.titleId}
                  className={`title-card ${title.isEquipped ? 'equipped' : ''}`}
                  style={{ 
                    borderColor: title.isEquipped ? getRarityColor(title.rarity) : 'rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <div className="title-icon">{title.iconEmoji}</div>
                  <div className="title-name">{title.titleName}</div>
                  <div className="title-description">{title.description}</div>
                  <div 
                    className="title-rarity-badge"
                    style={{ backgroundColor: getRarityColor(title.rarity) }}
                  >
                    {title.rarity}
                  </div>
                  {title.isEquipped ? (
                    <button 
                      className="unequip-btn"
                      onClick={handleUnequipTitle}
                    >
                      Bỏ đeo
                    </button>
                  ) : (
                    <button 
                      className="equip-btn"
                      onClick={() => handleEquipTitle(title.titleId)}
                    >
                      Đeo
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
