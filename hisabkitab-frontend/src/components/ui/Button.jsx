import { Link } from 'react-router-dom'

const baseStyles =
  'inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200'

const variants = {
  primary:
    'bg-indigo-600 text-white shadow-sm hover:-translate-y-0.5 hover:bg-indigo-500',
  secondary:
    'border border-slate-300 bg-white text-slate-700 hover:-translate-y-0.5 hover:bg-slate-50',
}

function Button({ as = 'button', to, variant = 'primary', className = '', children, ...props }) {
  const cls = `${baseStyles} ${variants[variant] || variants.primary} ${className}`

  if (as === 'link') {
    return (
      <Link to={to} className={cls} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button className={cls} {...props}>
      {children}
    </button>
  )
}

export default Button

