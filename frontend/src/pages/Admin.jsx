import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import './Admin.css'

function Admin() {
  const { user, token } = useAuth()
  const [activeTab, setActiveTab] = useState('photos')
  const [users, setUsers] = useState([])
  const [photos, setPhotos] = useState([])
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadForm, setUploadForm] = useState({
    rarity: 'C',
    collectionId: ''
  })
  
  // Collection form
  const [collectionForm, setCollectionForm] = useState({
    name: '',
    description: '',
    coverImageUrl: ''
  })
  const [showCollectionModal, setShowCollectionModal] = useState(false)
  const [editingCollection, setEditingCollection] = useState(null)
  
  // Photo edit
  const [editingPhoto, setEditingPhoto] = useState(null)
  const [photoEditForm, setPhotoEditForm] = useState({
    rarity: 'C',
    collectionId: ''
  })

  useEffect(() => {
    if (user && (user.role === 'SYSTEM_ADMIN' || user.role === 'CONTENT_ADMIN')) {
      fetchData()
    }
  }, [user, activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'X-User-Id': user.userId
      }
      
      if (activeTab === 'photos') {
        const response = await axios.get('http://localhost:8080/api/admin/photos', { headers })
        setPhotos(response.data)
      } else if (activeTab === 'collections') {
        const response = await axios.get('http://localhost:8080/api/admin/collections', { headers })
        setCollections(response.data)
      } else if (activeTab === 'users') {
        const response = await axios.get('http://localhost:8080/api/admin/users', { headers })
        setUsers(response.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePhotoRarity = async (photoId) => {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'X-User-Id': user.userId
      }
      
      const payload = {
        photoId: photoId,
        rarity: photoEditForm.rarity,
        collectionId: photoEditForm.collectionId || null
      }
      
      await axios.put('http://localhost:8080/api/admin/photos/rarity', payload, { headers })
      setEditingPhoto(null)
      fetchData()
      alert('Cập nhật độ hiếm thành công!')
    } catch (error) {
      console.error('Error updating photo:', error)
      alert('Có lỗi xảy ra khi cập nhật')
    }
  }

  const handleCreateCollection = async () => {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'X-User-Id': user.userId
      }
      
      if (editingCollection) {
        await axios.put(
          `http://localhost:8080/api/admin/collections/${editingCollection.collectionId}`,
          collectionForm,
          { headers }
        )
      } else {
        await axios.post(
          'http://localhost:8080/api/admin/collections',
          collectionForm,
          { headers }
        )
      }
      
      setShowCollectionModal(false)
      setCollectionForm({ name: '', description: '', coverImageUrl: '' })
      setEditingCollection(null)
      fetchData()
      alert(editingCollection ? 'Cập nhật bộ sưu tập thành công!' : 'Tạo bộ sưu tập thành công!')
    } catch (error) {
      console.error('Error saving collection:', error)
      alert('Có lỗi xảy ra')
    }
  }

  const handleDeleteCollection = async (collectionId) => {
    if (!window.confirm('Bạn có chắc muốn xóa bộ sưu tập này?')) return
    
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'X-User-Id': user.userId
      }
      
      await axios.delete(`http://localhost:8080/api/admin/collections/${collectionId}`, { headers })
      fetchData()
      alert('Xóa bộ sưu tập thành công!')
    } catch (error) {
      console.error('Error deleting collection:', error)
      alert('Có lỗi xảy ra khi xóa')
    }
  }

  const handleAssignPhotos = async () => {
    if (selectedPhotos.length === 0) {
      alert('Vui lòng chọn ít nhất một ảnh')
      return
    }
    
    const collectionId = prompt('Nhập ID bộ sưu tập muốn gán:')
    if (!collectionId) return
    
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'X-User-Id': user.userId
      }
      
      await axios.post(
        'http://localhost:8080/api/admin/collections/assign-photos',
        {
          collectionId: parseInt(collectionId),
          photoIds: selectedPhotos
        },
        { headers }
      )
      
      setSelectedPhotos([])
      fetchData()
      alert('Gán ảnh vào bộ sưu tập thành công!')
    } catch (error) {
      console.error('Error assigning photos:', error)
      alert('Có lỗi xảy ra')
    }
  }

  if (!user || (user.role !== 'SYSTEM_ADMIN' && user.role !== 'CONTENT_ADMIN')) {
    return (
      <div className="admin-container">
        <div className="access-denied">
          <h2>⚠️ Không có quyền truy cập</h2>
          <p>Bạn cần quyền Admin để truy cập trang này</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-container">
      <h1>🔧 Trang Quản trị</h1>
      
      <div className="admin-tabs">
        <button
          className={activeTab === 'photos' ? 'active' : ''}
          onClick={() => setActiveTab('photos')}
        >
          Quản lý Ảnh
        </button>
        <button
          className={activeTab === 'collections' ? 'active' : ''}
          onClick={() => setActiveTab('collections')}
        >
          Quản lý Bộ sưu tập
        </button>
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Quản lý Người dùng
        </button>
      </div>

      {activeTab === 'photos' && (
        <div className="admin-content">
          <div className="admin-actions">
            <button onClick={() => setShowUploadModal(true)}>
              + Upload Ảnh Mới
            </button>
            <button onClick={handleAssignPhotos} disabled={selectedPhotos.length === 0}>
              Gán {selectedPhotos.length} ảnh vào bộ sưu tập
            </button>
          </div>
          
          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : (
            <div className="photos-grid">
              {photos.map((photo) => (
                <div key={photo.photoId} className="photo-card-admin">
                  <input
                    type="checkbox"
                    checked={selectedPhotos.includes(photo.photoId)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPhotos([...selectedPhotos, photo.photoId])
                      } else {
                        setSelectedPhotos(selectedPhotos.filter(id => id !== photo.photoId))
                      }
                    }}
                  />
                  <img src={photo.imageUrl} alt={`Photo ${photo.photoId}`} />
                  <div className="photo-info-admin">
                    <p><strong>ID:</strong> {photo.photoId}</p>
                    <p><strong>Độ hiếm:</strong> 
                      <span className={`rarity-badge rarity-${photo.rarity}`}>
                        {photo.rarity}
                      </span>
                    </p>
                    <p><strong>Trạng thái:</strong> {photo.status}</p>
                    <p><strong>Bộ sưu tập:</strong> {photo.collection?.name || 'Chưa có'}</p>
                    <div className="photo-actions">
                      <button
                        onClick={() => {
                          setEditingPhoto(photo.photoId)
                          setPhotoEditForm({
                            rarity: photo.rarity,
                            collectionId: photo.collection?.collectionId || ''
                          })
                        }}
                        className="edit-btn"
                      >
                        Sửa
                      </button>
                      {photo.collection && (
                        <button
                          onClick={async () => {
                            if (window.confirm(`Bạn có chắc muốn xóa ảnh này khỏi bộ sưu tập "${photo.collection.name}"?`)) {
                              try {
                                const headers = {
                                  'Authorization': `Bearer ${token}`,
                                  'X-User-Id': user.userId
                                }
                                
                                await axios.delete(
                                  `http://localhost:8080/api/admin/photos/${photo.photoId}/collection`,
                                  { headers }
                                )
                                
                                fetchData()
                                alert('Đã xóa ảnh khỏi bộ sưu tập!')
                              } catch (error) {
                                console.error('Error removing photo from collection:', error)
                                alert('Có lỗi xảy ra khi xóa ảnh khỏi bộ sưu tập')
                              }
                            }
                          }}
                          className="remove-collection-btn"
                        >
                          Xóa khỏi bộ sưu tập
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'collections' && (
        <div className="admin-content">
          <div className="admin-actions">
            <button onClick={() => {
              setEditingCollection(null)
              setCollectionForm({ name: '', description: '', coverImageUrl: '' })
              setShowCollectionModal(true)
            }}>
              + Tạo Bộ sưu tập mới
            </button>
          </div>
          
          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : (
            <div className="collections-list">
              {collections.map((collection) => (
                <div key={collection.collectionId} className="collection-card-admin">
                  <div className="collection-info">
                    <h3>{collection.name}</h3>
                    <p>{collection.description || 'Không có mô tả'}</p>
                    <p><strong>ID:</strong> {collection.collectionId}</p>
                  </div>
                  <div className="collection-actions">
                    <button
                      onClick={() => {
                        setEditingCollection(collection)
                        setCollectionForm({
                          name: collection.name,
                          description: collection.description || '',
                          coverImageUrl: collection.coverImageUrl || ''
                        })
                        setShowCollectionModal(true)
                      }}
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteCollection(collection.collectionId)}
                      className="delete-btn"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="admin-content">
          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : (
            <div className="users-list">
              {users.map((userItem) => (
                <div key={userItem.userId} className="user-card-admin">
                  <div className="user-info">
                    <h3>{userItem.username}</h3>
                    <p><strong>Email:</strong> {userItem.email}</p>
                    <p><strong>Họ tên:</strong> {userItem.fullName || 'Chưa có'}</p>
                    <p><strong>Role hiện tại:</strong> 
                      <span className={`role-badge role-${userItem.role}`}>
                        {userItem.role}
                      </span>
                    </p>
                    <p><strong>Vé:</strong> {userItem.ticketBalance} | <strong>Coin:</strong> {userItem.coinBalance}</p>
                    <p><strong>Trạng thái:</strong> {userItem.isBanned ? '❌ Bị khóa' : '✅ Hoạt động'}</p>
                  </div>
                  <div className="user-actions">
                    <button
                      onClick={() => {
                        setEditingUser(userItem.userId)
                        setUserEditForm({ role: userItem.role })
                      }}
                    >
                      Sửa Role
                    </button>
                    {userItem.isBanned ? (
                      <button
                        onClick={async () => {
                          if (!window.confirm('Bỏ khóa user này?')) return
                          try {
                            const headers = {
                              'Authorization': `Bearer ${token}`,
                              'X-User-Id': user.userId
                            }
                            await axios.post(
                              `http://localhost:8080/api/admin/users/${userItem.userId}/unban`,
                              {},
                              { headers }
                            )
                            fetchData()
                            alert('Đã bỏ khóa user!')
                          } catch (error) {
                            alert('Có lỗi xảy ra')
                          }
                        }}
                        className="unban-btn"
                      >
                        Bỏ khóa
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          const reason = prompt('Lý do khóa:')
                          if (!reason) return
                          if (!window.confirm('Khóa user này?')) return
                          try {
                            const headers = {
                              'Authorization': `Bearer ${token}`,
                              'X-User-Id': user.userId
                            }
                            await axios.post(
                              `http://localhost:8080/api/admin/users/${userItem.userId}/ban`,
                              { reason },
                              { headers }
                            )
                            fetchData()
                            alert('Đã khóa user!')
                          } catch (error) {
                            alert('Có lỗi xảy ra')
                          }
                        }}
                        className="ban-btn"
                      >
                        Khóa
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Photo Edit Modal */}
      {editingPhoto && (
        <div className="modal-overlay" onClick={() => setEditingPhoto(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Sửa Ảnh #{editingPhoto}</h2>
            <div className="form-group">
              <label>Độ hiếm</label>
              <select
                value={photoEditForm.rarity}
                onChange={(e) => setPhotoEditForm({...photoEditForm, rarity: e.target.value})}
              >
                <option value="N">N - NPC (Quần Chúng) - 30%</option>
                <option value="C">C - Common (Thường Dân) - 25%</option>
                <option value="R">R - Rare (Có Nét) - 20%</option>
                <option value="SR">SR - Super Rare (Visual) - 10%</option>
                <option value="SSR">SSR - Squad (Hội Bạn Thân) - 8%</option>
                <option value="UR">UR - Ultra Rare (Meme Lord) - 4%</option>
                <option value="L">L - Legendary (Góc Chết) - 2%</option>
                <option value="X">X - Forbidden (Tài Liệu Mật) - 1%</option>
              </select>
            </div>
            <div className="form-group">
              <label>Bộ sưu tập (ID)</label>
              <input
                type="number"
                value={photoEditForm.collectionId}
                onChange={(e) => setPhotoEditForm({...photoEditForm, collectionId: e.target.value})}
                placeholder="Để trống để bỏ gán"
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => handleUpdatePhotoRarity(editingPhoto)}>Lưu</button>
              <button onClick={() => setEditingPhoto(null)}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* Collection Modal */}
      {showCollectionModal && (
        <div className="modal-overlay" onClick={() => setShowCollectionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingCollection ? 'Sửa Bộ sưu tập' : 'Tạo Bộ sưu tập mới'}</h2>
            <div className="form-group">
              <label>Tên bộ sưu tập *</label>
              <input
                type="text"
                value={collectionForm.name}
                onChange={(e) => setCollectionForm({...collectionForm, name: e.target.value})}
                placeholder="VD: Bộ sưu tập Lớp 12"
                required
              />
            </div>
            <div className="form-group">
              <label>Mô tả</label>
              <textarea
                value={collectionForm.description}
                onChange={(e) => setCollectionForm({...collectionForm, description: e.target.value})}
                placeholder="Mô tả bộ sưu tập"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Ảnh bìa (URL)</label>
              <input
                type="text"
                value={collectionForm.coverImageUrl}
                onChange={(e) => setCollectionForm({...collectionForm, coverImageUrl: e.target.value})}
                placeholder="URL ảnh bìa"
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleCreateCollection}>Lưu</button>
              <button onClick={() => setShowCollectionModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Photo Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Upload Ảnh Mới</h2>
            <div className="form-group">
              <label>Chọn ảnh</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setUploadFile(e.target.files[0])}
              />
              {uploadFile && (
                <div style={{ marginTop: '1rem' }}>
                  <img 
                    src={URL.createObjectURL(uploadFile)} 
                    alt="Preview" 
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                  />
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Độ hiếm</label>
              <select
                value={uploadForm.rarity}
                onChange={(e) => setUploadForm({...uploadForm, rarity: e.target.value})}
              >
                <option value="N">N - NPC (Quần Chúng) - 30%</option>
                <option value="C">C - Common (Thường Dân) - 25%</option>
                <option value="R">R - Rare (Có Nét) - 20%</option>
                <option value="SR">SR - Super Rare (Visual) - 10%</option>
                <option value="SSR">SSR - Squad (Hội Bạn Thân) - 8%</option>
                <option value="UR">UR - Ultra Rare (Meme Lord) - 4%</option>
                <option value="L">L - Legendary (Góc Chết) - 2%</option>
                <option value="X">X - Forbidden (Tài Liệu Mật) - 1%</option>
              </select>
            </div>
            <div className="form-group">
              <label>Bộ sưu tập (ID - tùy chọn)</label>
              <input
                type="number"
                value={uploadForm.collectionId}
                onChange={(e) => setUploadForm({...uploadForm, collectionId: e.target.value})}
                placeholder="Để trống nếu không gán"
              />
            </div>
            <div className="modal-actions">
              <button onClick={async () => {
                if (!uploadFile) {
                  alert('Vui lòng chọn ảnh')
                  return
                }
                
                try {
                  const headers = {
                    'Authorization': `Bearer ${token}`,
                    'X-User-Id': user.userId,
                    'Content-Type': 'multipart/form-data'
                  }
                  
                  // Upload file
                  const formData = new FormData()
                  formData.append('file', uploadFile)
                  
                  const uploadResponse = await axios.post(
                    'http://localhost:8080/api/upload/image',
                    formData,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                  )
                  
                  if (uploadResponse.data.url) {
                    // Create photo record
                    const photoData = {
                      imageUrl: `http://localhost:8080${uploadResponse.data.url}`,
                      rarity: uploadForm.rarity,
                      collectionId: uploadForm.collectionId || null
                    }
                    
                    await axios.post(
                      'http://localhost:8080/api/admin/photos',
                      photoData,
                      { headers: { 'Authorization': `Bearer ${token}`, 'X-User-Id': user.userId } }
                    )
                    
                    setShowUploadModal(false)
                    setUploadFile(null)
                    setUploadForm({ rarity: 'C', collectionId: '' })
                    fetchData()
                    alert('Upload ảnh thành công!')
                  }
                } catch (error) {
                  console.error('Error uploading:', error)
                  alert('Có lỗi xảy ra khi upload ảnh')
                }
              }}>Upload</button>
              <button onClick={() => {
                setShowUploadModal(false)
                setUploadFile(null)
                setUploadForm({ rarity: 'C', collectionId: '' })
              }}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin

