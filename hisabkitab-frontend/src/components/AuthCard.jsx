function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-xl shadow-indigo-100/40 backdrop-blur">
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
      </div>
      {children}
      {footer && <div className="mt-5">{footer}</div>}
    </div>
  )
}

export default AuthCard

