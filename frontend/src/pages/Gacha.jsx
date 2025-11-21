import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import AuthModal from '../components/AuthModal'
import './Gacha.css'

function Gacha() {
  const { user, token, isAuthenticated } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [ticketBalance, setTicketBalance] = useState(0)
  const [coinBalance, setCoinBalance] = useState(0)
  const [showMeteor, setShowMeteor] = useState(false)
  const [meteorRarity, setMeteorRarity] = useState(null)
  const [revealedPhoto, setRevealedPhoto] = useState(null)
  const [animationPhase, setAnimationPhase] = useState('idle') // 'idle' | 'meteor' | 'reveal' | 'complete'
  const [canSkip, setCanSkip] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserBalance()
    }
  }, [user])

  const fetchUserBalance = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/users/${user.userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setTicketBalance(response.data.ticketBalance || 0)
      setCoinBalance(response.data.coinBalance || 0)
    } catch (error) {
      console.error('Error fetching user balance:', error)
    }
  }

  // Hiệu ứng Meteor giống Genshin
  const playMeteorAnimation = (photo) => {
    return new Promise((resolve) => {
      setRevealedPhoto(photo)
      setMeteorRarity(photo.rarity)
      setShowMeteor(true)
      setAnimationPhase('meteor')
      setCanSkip(true)

      // Meteor rơi xuống (1.5s)
      setTimeout(() => {
        setAnimationPhase('reveal')
        
        // Reveal card (1s)
        setTimeout(() => {
          setAnimationPhase('complete')
          
          // Complete (0.5s)
          setTimeout(() => {
            setShowMeteor(false)
            setAnimationPhase('idle')
            setCanSkip(false)
            resolve()
          }, 500)
        }, 1000)
      }, 1500)
    })
  }

  const skipAnimation = () => {
    if (canSkip && revealedPhoto) {
      setShowMeteor(false)
      setAnimationPhase('idle')
      setCanSkip(false)
    }
  }

  const handleSinglePull = async () => {
    if (!isAuthenticated || !user) {
      setShowAuthModal(true)
      return
    }

    if (ticketBalance < 1) {
      alert('Không đủ vé để quay!')
      return
    }

    setIsPulling(true)
    setError('')
    setResult(null)
    setShowMeteor(false)
    setAnimationPhase('idle')

    try {
      const response = await axios.post(
        'http://localhost:8080/api/gacha/single',
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-Id': user.userId
          }
        }
      )

      if (response.data.photo) {
        const photo = response.data.photo
        
        // Chơi hiệu ứng meteor
        await playMeteorAnimation(photo)
        
        setResult({
          photo: photo,
          ticketBalance: response.data.ticketBalance,
          coinBalance: response.data.coinBalance,
          isMulti: false
        })
        setTicketBalance(response.data.ticketBalance)
        setCoinBalance(response.data.coinBalance)
        
        // Trigger custom event để các trang khác refresh inventory
        window.dispatchEvent(new CustomEvent('inventoryUpdated'))
      } else {
        setError(response.data.message || 'Có lỗi xảy ra')
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi quay gacha')
    } finally {
      setIsPulling(false)
    }
  }

  const handleMultiPull = async () => {
    if (!isAuthenticated || !user) {
      setShowAuthModal(true)
      return
    }

    if (ticketBalance < 10) {
      alert('Không đủ vé để quay 10! (Cần 10 vé)')
      return
    }

    setIsPulling(true)
    setError('')
    setResult(null)

    try {
      const response = await axios.post(
        'http://localhost:8080/api/gacha/multi',
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-Id': user.userId
          }
        }
      )

      if (response.data.success) {
        setResult({
          photos: response.data.photos,
          ticketBalance: response.data.ticketBalance,
          coinBalance: response.data.coinBalance,
          isMulti: true
        })
        setTicketBalance(response.data.ticketBalance)
        setCoinBalance(response.data.coinBalance)
        
        // Trigger custom event để các trang khác refresh inventory
        window.dispatchEvent(new CustomEvent('inventoryUpdated'))
      } else {
        setError(response.data.message || 'Có lỗi xảy ra')
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi quay gacha')
    } finally {
      setIsPulling(false)
    }
  }

  const handleSinglePullWithCoins = async () => {
    if (!isAuthenticated || !user) {
      setShowAuthModal(true)
      return
    }

    const COIN_COST = 50
    if (coinBalance < COIN_COST) {
      alert(`Không đủ coin để quay! (Cần ${COIN_COST} coin)`)
      return
    }

    setIsPulling(true)
    setError('')
    setResult(null)
    setShowMeteor(false)
    setAnimationPhase('idle')

    try {
      const response = await axios.post(
        'http://localhost:8080/api/gacha/single-coin',
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-Id': user.userId
          }
        }
      )

      if (response.data.photo) {
        const photo = response.data.photo
        
        // Chơi hiệu ứng meteor
        await playMeteorAnimation(photo)
        
        setResult({
          photo: photo,
          ticketBalance: response.data.ticketBalance,
          coinBalance: response.data.coinBalance,
          isMulti: false
        })
        setTicketBalance(response.data.ticketBalance)
        setCoinBalance(response.data.coinBalance)
        
        // Trigger custom event để các trang khác refresh inventory
        window.dispatchEvent(new CustomEvent('inventoryUpdated'))
      } else {
        setError(response.data.message || 'Có lỗi xảy ra')
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi quay gacha')
    } finally {
      setIsPulling(false)
    }
  }

  const handleMultiPullWithCoins = async () => {
    if (!isAuthenticated || !user) {
      setShowAuthModal(true)
      return
    }

    const COIN_COST = 450
    if (coinBalance < COIN_COST) {
      alert(`Không đủ coin để quay 10! (Cần ${COIN_COST} coin)`)
      return
    }

    setIsPulling(true)
    setError('')
    setResult(null)

    try {
      const response = await axios.post(
        'http://localhost:8080/api/gacha/multi-coin',
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-Id': user.userId
          }
        }
      )

      if (response.data.success) {
        setResult({
          photos: response.data.photos,
          ticketBalance: response.data.ticketBalance,
          coinBalance: response.data.coinBalance,
          isMulti: true
        })
        setTicketBalance(response.data.ticketBalance)
        setCoinBalance(response.data.coinBalance)
        
        // Trigger custom event để các trang khác refresh inventory
        window.dispatchEvent(new CustomEvent('inventoryUpdated'))
      } else {
        setError(response.data.message || 'Có lỗi xảy ra')
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi quay gacha')
    } finally {
      setIsPulling(false)
    }
  }

  const getRarityColor = (rarity) => {
    const colors = {
      'N': '#808080', // Xám
      'C': '#4caf50', // Xanh lá
      'R': '#2196f3', // Xanh dương
      'SR': '#9c27b0', // Tím
      'SSR': '#ff9800', // Cam
      'UR': '#f44336', // Đỏ
      'L': '#ffd700', // Vàng
      'X': '#212121' // Đen
    }
    return colors[rarity] || '#ffffff'
  }

  return (
    <div className="gacha">
      <h1>🎰 Quay Gacha</h1>
      <div className="gacha-container">
        <div className="gacha-info">
          <p>Vé hiện có: <strong>{ticketBalance}</strong></p>
          <p>Coin hiện có: <strong>{coinBalance}</strong></p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="gacha-buttons">
          <button 
            className="gacha-btn single-pull"
            onClick={handleSinglePull}
            disabled={isPulling || ticketBalance < 1}
          >
            {isPulling ? 'Đang quay...' : 'Quay đơn (1 vé)'}
          </button>
          <button 
            className="gacha-btn multi-pull"
            onClick={handleMultiPull}
            disabled={isPulling || ticketBalance < 10}
          >
            {isPulling ? 'Đang quay...' : 'Quay 10 (10 vé)'}
          </button>
        </div>

        <div className="gacha-divider">
          <span>HOẶC</span>
        </div>

        <div className="gacha-buttons">
          <button 
            className="gacha-btn single-pull-coin"
            onClick={handleSinglePullWithCoins}
            disabled={isPulling || coinBalance < 50}
          >
            {isPulling ? 'Đang quay...' : '💰 Quay đơn (50 coin)'}
          </button>
          <button 
            className="gacha-btn multi-pull-coin"
            onClick={handleMultiPullWithCoins}
            disabled={isPulling || coinBalance < 450}
          >
            {isPulling ? 'Đang quay...' : '💰 Quay 10 (450 coin)'}
          </button>
        </div>

        {/* Hiệu ứng Meteor giống Genshin */}
        {showMeteor && revealedPhoto && (
          <div className="meteor-overlay">
            {/* Skip Button */}
            {canSkip && (
              <button className="skip-animation-btn" onClick={skipAnimation}>
                Bỏ qua
              </button>
            )}

            {/* Meteor Phase */}
            {animationPhase === 'meteor' && (
              <div className="meteor-container">
                <div 
                  className="meteor-trail"
                  style={{ '--rarity-color': getRarityColor(meteorRarity) }}
                >
                  <div className="meteor-core"></div>
                  <div className="meteor-sparkles">
                    {[...Array(20)].map((_, i) => {
                      const angle = (i * 360) / 20
                      const angleRad = (angle * Math.PI) / 180
                      const distance = 100
                      const x = Math.cos(angleRad) * distance
                      const y = Math.sin(angleRad) * distance
                      
                      return (
                        <div 
                          key={i}
                          className="sparkle"
                          style={{
                            '--delay': `${i * 0.05}s`,
                            '--x': `${x}px`,
                            '--y': `${y}px`
                          }}
                        ></div>
                      )
                    })}
                  </div>
                </div>
                <div 
                  className="meteor-glow"
                  style={{ '--rarity-color': getRarityColor(meteorRarity) }}
                ></div>
              </div>
            )}

            {/* Reveal Phase */}
            {(animationPhase === 'reveal' || animationPhase === 'complete') && (
              <div className="wish-reveal-container">
                <div 
                  className="wish-card"
                  style={{ '--rarity-color': getRarityColor(revealedPhoto.rarity) }}
                >
                  <div className="wish-card-glow"></div>
                  <div className="wish-card-content">
                    <div className="wish-card-image-wrapper">
                      <img 
                        src={revealedPhoto.imageUrl} 
                        alt="Wish result"
                        className="wish-card-image"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400?text=No+Image'
                        }}
                      />
                    </div>
                    <div className="wish-card-info">
                      <div className="wish-rarity-badge">
                        {revealedPhoto.rarity}
                      </div>
                      {revealedPhoto.collection && (
                        <div className="wish-collection-name">
                          {revealedPhoto.collection.name}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Particles cho rare items */}
                  {['SR', 'SSR', 'UR', 'L', 'X'].includes(revealedPhoto.rarity) && (
                    <div className="wish-particles">
                      {[...Array(30)].map((_, i) => {
                        const angle = (i * 360) / 30
                        const angleRad = (angle * Math.PI) / 180
                        const distance = 300
                        const x = Math.cos(angleRad) * distance
                        const y = Math.sin(angleRad) * distance
                        
                        return (
                          <div 
                            key={i}
                            className="wish-particle"
                            style={{
                              '--delay': `${i * 0.05}s`,
                              '--x': `${x}px`,
                              '--y': `${y}px`,
                              '--rarity-color': getRarityColor(revealedPhoto.rarity)
                            }}
                          ></div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {result && (
          <div className="gacha-result">
            <h2>{result.isMulti ? 'Kết quả quay 10:' : 'Kết quả quay:'}</h2>
            {result.isMulti ? (
              <div className="photos-grid">
                {result.photos.map((photo, index) => (
                  <div key={index} className="photo-card-result">
                    <img 
                      src={photo.imageUrl} 
                      alt={`Photo ${photo.photoId}`}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200?text=No+Image'
                      }}
                    />
                    <div 
                      className="rarity-badge"
                      style={{ backgroundColor: getRarityColor(photo.rarity) }}
                    >
                      {photo.rarity}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="single-result">
                <div className="photo-card-result featured">
                  <img 
                    src={result.photo.imageUrl} 
                    alt={`Photo ${result.photo.photoId}`}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400?text=No+Image'
                    }}
                  />
                  <div 
                    className="rarity-badge large"
                    style={{ backgroundColor: getRarityColor(result.photo.rarity) }}
                  >
                    {result.photo.rarity}
                  </div>
                  <p className="photo-name">
                    {result.photo.collection?.name || 'Chưa có bộ sưu tập'}
                  </p>
                </div>
              </div>
            )}
            <div className="balance-update">
              <p>Vé còn lại: <strong>{result.ticketBalance}</strong></p>
              <p>Coin: <strong>{result.coinBalance}</strong></p>
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  )
}

export default Gacha

