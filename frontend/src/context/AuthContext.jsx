import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, signup as apiSignup, fetchCurrentUser } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider(props) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(function () {
    const stored = window.localStorage.getItem('datahive_token')
    if (!stored) {
      setReady(true)
      return
    }
    fetchCurrentUser(stored)
      .then(function (userData) {
        setUser(userData)
        setToken(stored)
      })
      .catch(function () {
        window.localStorage.removeItem('datahive_token')
      })
      .finally(function () {
        setReady(true)
      })
  }, [])

  function login(email, password) {
    return apiLogin({ email: email, password: password }).then(function (data) {
      window.localStorage.setItem('datahive_token', data.token)
      setToken(data.token)
      setUser(data.user)
      return data.user
    })
  }

  function signup(name, email, password) {
    return apiSignup({ name: name, email: email, password: password }).then(function (data) {
      window.localStorage.setItem('datahive_token', data.token)
      setToken(data.token)
      setUser(data.user)
      return data.user
    })
  }

  function logout() {
    window.localStorage.removeItem('datahive_token')
    setToken(null)
    setUser(null)
  }

  const value = {
    user: user,
    token: token,
    ready: ready,
    isLoggedIn: !!user,
    login: login,
    signup: signup,
    logout: logout,
  }

  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}