import { useEffect, useState } from 'react'
import PageCard from '../components/PageCard.jsx'
import AlertBox from '../components/AlertBox.jsx'
import { getMe, updateMe } from '../services/userService.js'
import { renewSubscription } from '../services/shopService.js'

function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [profile, setProfile] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [saving, setSaving] = useState(false)
  const [renewing, setRenewing] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      setSuccess('')
      try {
        const me = await getMe()
        setProfile(me)
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleEdit = () => {
    if (!profile) return
    setDraftName(profile.name || '')
    setEditMode(true)
    setSuccess('')
    setError('')
  }

  const handleSaveName = async () => {
    if (!draftName.trim()) {
      setError('Name cannot be empty')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const updated = await updateMe({ name: draftName })
      setProfile(updated)
      setEditMode(false)
      setSuccess('Profile updated')
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleRenew = async () => {
    setRenewing(true)
    setError('')
    setSuccess('')
    try {
      const data = await renewSubscription()
      setSuccess(data?.message || 'Subscription renewed')
      const me = await getMe()
      setProfile(me)
    } catch (err) {
      setError(err?.response?.data?.message || 'Renewal failed')
    } finally {
      setRenewing(false)
    }
  }

  const subscriptionActive = Boolean(profile?.subscriptionActive)
  const expiresAt = profile?.subscription?.expiresAt
  const plan = profile?.subscription?.plan

  return (
    <PageCard title="Profile & Settings">
      <div className="space-y-3">
        <AlertBox message={error} />
        <AlertBox message={success} tone="success" />

        {loading && <div className="text-sm text-slate-600">Loading...</div>}

        {!loading && profile && (
          <>
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="text-xs font-semibold text-slate-600">
                Shop owner details
              </div>

              <div className="mt-2 space-y-3">
                <label className="block">
                  <div className="mb-1 text-sm font-medium text-slate-700">
                    Name
                  </div>
                  {editMode ? (
                    <div className="flex gap-2">
                      <input
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        disabled={saving}
                        onClick={handleSaveName}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-slate-900">
                        {profile.name || '—'}
                      </div>
                      <button
                        type="button"
                        onClick={handleEdit}
                        disabled={saving}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </label>

                <div className="rounded-lg bg-slate-50 p-3">
                  <div className="text-sm text-slate-700">Phone</div>
                  <div className="mt-1 font-mono text-sm text-slate-900">
                    {profile.phone || '—'}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-3">
              <div className="text-xs font-semibold text-slate-600">
                Subscription
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-md px-2 py-1 text-xs font-semibold ${
                    subscriptionActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {subscriptionActive ? 'Active' : 'Expired'}
                </span>
                {plan && (
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                    {plan}
                  </span>
                )}
              </div>

              {expiresAt && (
                <p className="mt-2 text-sm text-slate-600">
                  Expires at: {new Date(expiresAt).toLocaleDateString()}
                </p>
              )}

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={renewing}
                  onClick={handleRenew}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {renewing ? 'Renewing...' : 'Renew Subscription'}
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-3">
              <div className="text-xs font-semibold text-slate-600">
                Security
              </div>

              <div className="mt-2 space-y-3">
                <p className="text-sm text-slate-600">
                  Change password UI is optional and currently not wired to
                  backend.
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <input
                    type="password"
                    placeholder="Current password"
                    disabled
                    className="w-full cursor-not-allowed rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-500 outline-none"
                  />
                  <input
                    type="password"
                    placeholder="New password"
                    disabled
                    className="w-full cursor-not-allowed rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </PageCard>
  )
}

export default ProfilePage

