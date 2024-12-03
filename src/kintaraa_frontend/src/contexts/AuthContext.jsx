// src/contexts/AuthContext.jsx
import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Check if user info is stored in localStorage
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : null
  })
  const navigate = useNavigate()

  const login = async (email, password, userType) => {
    try {
      // In a real app, this would be an API call
      const mockUser = {
        id: '1',
        email,
        name: 'John Doe',
        userType,
        avatar: 'JD',
      }

      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(mockUser))
      setUser(mockUser)
      toast.success('Successfully logged in!')
      navigate(`/dashboard/${userType}`)
    } catch (error) {
      toast.error('Invalid credentials')
      throw error
    }
  }

  const register = async (userData) => {
    try {
      // In a real app, this would be an API call
      const mockUser = {
        id: '1',
        email: userData.email,
        name: userData.fullName,
        userType: userData.userType,
        avatar: userData.fullName.split(' ').map(n => n[0]).join(''),
      }

      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(mockUser))
      setUser(mockUser)
      toast.success('Registration successful!')
      navigate(`/dashboard/${userData.userType}`)
    } catch (error) {
      toast.error('Registration failed')
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('user')
    setUser(null)
    toast.success('Successfully logged out')
    navigate('/login')
  }

  const updateProfile = async (updates) => {
    try {
      // In a real app, this would be an API call
      const updatedUser = { ...user, ...updates }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
      throw error
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}