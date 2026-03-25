import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Billing', end: true },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/items', label: 'Items' },
  { to: '/bills', label: 'Bills' },
  { to: '/devices', label: 'Devices' },
  { to: '/subscription', label: 'Plan' },
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
