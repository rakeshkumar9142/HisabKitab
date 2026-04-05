import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/app', label: 'Home', end: true },
  { to: '/app/billing', label: 'Bill' },
  { to: '/app/items', label: 'Items' },
  { to: '/app/bills', label: 'Bills' },
  { to: '/app/profile', label: 'Profile' },
]

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-3xl justify-between px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex-1 py-3 text-center text-xs font-medium ${isActive ? 'text-blue-600' : 'text-slate-500'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
