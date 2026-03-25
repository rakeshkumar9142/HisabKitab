import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import BottomNav from '../components/BottomNav.jsx'

function DashboardLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="mx-auto min-h-screen w-full max-w-3xl pb-20">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-800">HisabKitab POS</h1>
            <p className="text-xs text-slate-500">Welcome, {user?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/profile"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
            >
              Profile
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="space-y-4 px-4 py-4">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}

export default DashboardLayout
