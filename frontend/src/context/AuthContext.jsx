import { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    // Check if user is logged in on mount
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
    }
    setLoading(false)
  }, [])

  const login = async (usernameOrEmail, password) => {
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        usernameOrEmail,
        password
      })

      if (response.data.token) {
        const { token, userId, username, email, role } = response.data
        const userData = { userId, username, email, role }
        
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        
        setToken(token)
        setUser(userData)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        return { success: true, message: response.data.message }
      } else {
        return { success: false, message: response.data.message || 'Login failed' }
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.' 
      }
    }
  }

  const register = async (registerData) => {
    try {
      const response = await axios.post('http://localhost:8080/api/auth/register', registerData)

      if (response.data.token) {
        const { token, userId, username, email, role } = response.data
        const userData = { userId, username, email, role }
        
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        
        setToken(token)
        setUser(userData)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        return { success: true, message: response.data.message }
      } else {
        return { success: false, message: response.data.message || 'Registration failed' }
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Please try again.' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!token
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

