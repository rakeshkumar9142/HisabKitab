import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import DashboardLayout from './pages/DashboardLayout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import BillingPage from './pages/BillingPage.jsx'
import ItemsPage from './pages/ItemsPage.jsx'
import BillsHistoryPage from './pages/BillsHistoryPage.jsx'
import DevicesPage from './pages/DevicesPage.jsx'
import SubscriptionPage from './pages/SubscriptionPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import LandingPage from './pages/LandingPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing" element={<Navigate to="/" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="items" element={<ItemsPage />} />
        <Route path="bills" element={<BillsHistoryPage />} />
        <Route path="devices" element={<DevicesPage />} />
        <Route path="subscription" element={<SubscriptionPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
