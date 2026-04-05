import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageCard from '../components/PageCard.jsx'
import AlertBox from '../components/AlertBox.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getPrintDeviceToken, setPrintDeviceToken } from '../services/printService.js'

function ProfilePage() {
  const { user, refreshProfile, updateProfile } = useAuth()
  const [name, setName] = useState('')
  const [printToken, setPrintToken] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    refreshProfile().catch(() => {})
  }, [refreshProfile])

  useEffect(() => {
    if (user?.name) setName(user.name)
  }, [user?.name])

  useEffect(() => {
    setPrintToken(getPrintDeviceToken())
  }, [])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Name is required.')
      return
    }
    setSaving(true)
    try {
      await updateProfile({ name: trimmed })
      setSuccess('Profile updated.')
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not update profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleSavePrintToken = () => {
    setPrintDeviceToken(printToken)
    setSuccess('Print device token saved on this device.')
  }

  const sub = user?.subscription
  const active = user?.subscriptionActive

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800">Profile & settings</h2>

      <PageCard title="Account">
        <form onSubmit={handleSaveProfile} className="space-y-3">
          <AlertBox message={error} />
          <AlertBox message={success} tone="success" />

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="profile-name">
              Name
            </label>
            <input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="profile-phone">
              Phone
            </label>
            <input
              id="profile-phone"
              value={user?.phone || ''}
              readOnly
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
            />
            <p className="mt-1 text-xs text-slate-500">Phone cannot be changed from the app.</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save name'}
          </button>
        </form>
      </PageCard>

      <PageCard title="Subscription">
        <p className="text-sm text-slate-700">
          Status:{' '}
          <span className="font-semibold">{active ? 'Active' : 'Inactive / expired'}</span>
        </p>
        {sub?.expiresAt && (
          <p className="mt-1 text-sm text-slate-600">
            Expires: {new Date(sub.expiresAt).toLocaleString()}
          </p>
        )}
        <Link to="/app/subscription" className="mt-3 inline-block text-sm font-medium text-blue-600">
          Manage subscription →
        </Link>
      </PageCard>

      <PageCard title="Print bridge">
        <p className="mb-2 text-xs text-slate-500">
          Token from device registration (stored only in this browser). Used when you tap &quot;Print bill&quot; after
          billing.
        </p>
        <input
          value={printToken}
          onChange={(e) => setPrintToken(e.target.value)}
          placeholder="Paste device token"
          className="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs outline-none focus:border-blue-500"
        />
        <button
          type="button"
          onClick={handleSavePrintToken}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Save print token
        </button>
      </PageCard>

      <PageCard title="Security">
        <p className="mb-2 text-sm text-slate-600">Change password</p>
        <input
          type="password"
          disabled
          placeholder="Not available in app yet"
          className="mb-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
        />
        <p className="text-xs text-slate-500">Password changes will be added in a future update.</p>
      </PageCard>

      <div className="flex flex-wrap gap-2 pb-2">
        <Link to="/app/devices" className="text-sm font-medium text-blue-600">
          Devices →
        </Link>
        <span className="text-slate-300">|</span>
        <Link to="/app/billing" className="text-sm font-medium text-blue-600">
          Billing →
        </Link>
      </div>
    </div>
  )
}

export default ProfilePage
