import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import AlertBox from '../components/AlertBox.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getErrorMessage } from '../services/api.js'

function RegisterPage() {
  const { isAuthenticated, register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <form onSubmit={handleSubmit} className="w-full space-y-4 rounded-xl bg-white p-5 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">Create Shop Account</h1>
        <AlertBox message={error} />
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Owner/Shop name"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
          required
        />
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone number"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
          required
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600">
            Login
          </Link>
        </p>
      </form>
    </div>
  )
}

export default RegisterPage
