import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home            from './pages/Home'
import Login           from './pages/Login'
import Signup          from './pages/Signup'
import ForgotPassword  from './pages/ForgotPassword'
import Profile         from './pages/Profile'
import Orders          from './pages/Orders'
import Wishlist        from './pages/Wishlist'
import Cart            from './pages/Cart'
import Reviews         from './pages/Reviews'
import AccountSettings from './pages/AccountSettings'
import AdminDashboard  from './pages/AdminDashboard'
import ProductDetails  from './pages/ProductDetails'
import FAQ             from './pages/FAQ'
import Checkout        from './pages/Checkout'
import Notifications   from './pages/Notifications'
import Footer          from './components/Footer'

import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="app-wrapper">
            <Routes>
            <Route path="/"                element={<Home />} />
            <Route path="/login"           element={<Login />} />
            <Route path="/signup"          element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile"         element={<Profile />} />
            <Route path="/orders"          element={<Orders />} />
            <Route path="/wishlist"        element={<Wishlist />} />
            <Route path="/cart"            element={<Cart />} />
            <Route path="/reviews"         element={<Reviews />} />
            <Route path="/settings"        element={<AccountSettings />} />
            <Route path="/admin"           element={<AdminDashboard />} />
            <Route path="/product/:id"     element={<ProductDetails />} />
            <Route path="/faq"             element={<FAQ />} />
            <Route path="/checkout"        element={<Checkout />} />
            <Route path="/notifications"   element={<Notifications />} />
            </Routes>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
