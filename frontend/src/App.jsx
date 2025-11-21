import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import Gacha from './pages/Gacha'
import Collection from './pages/Collection'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import Marketplace from './pages/Marketplace'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={
          <Layout>
            <Home />
          </Layout>
        } />
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                {/* Guest có thể xem Gallery và Marketplace */}
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/marketplace" element={<Marketplace />} />
                
                {/* Các trang cần đăng nhập */}
                <Route path="/gacha" element={
                  <ProtectedRoute>
                    <Gacha />
                  </ProtectedRoute>
                } />
                <Route path="/collection" element={
                  <ProtectedRoute>
                    <Collection />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                } />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

export default App

