import { useState } from 'react'
import AlertBox from '../components/AlertBox.jsx'
import PageCard from '../components/PageCard.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getErrorMessage } from '../services/api.js'
import { getBills } from '../services/billService.js'
import { renewSubscription } from '../services/shopService.js'

function SubscriptionPage() {
  const { refreshProfile } = useAuth()
  const [status, setStatus] = useState('Unknown')
  const [expiresAt, setExpiresAt] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [checking, setChecking] = useState(false)
  const [renewing, setRenewing] = useState(false)

  const checkStatus = async () => {
    setError('')
    setSuccess('')
    setChecking(true)
    try {
      await getBills()
      setStatus('Active')
      setSuccess('Subscription appears active.')
    } catch (err) {
      if (err?.response?.status === 403) {
        setStatus('Expired')
        setError(getErrorMessage(err))
      } else {
        setError(getErrorMessage(err, 'Unable to verify subscription status'))
      }
    } finally {
      setChecking(false)
    }
  }

  const handleRenew = async () => {
    setError('')
    setSuccess('')
    setRenewing(true)
    try {
      const data = await renewSubscription()
      setStatus('Active')
      setExpiresAt(data.expiresAt)
      setSuccess(data.message || 'Subscription renewed successfully')
      await refreshProfile().catch(() => {})
    } catch (err) {
      setError(getErrorMessage(err, 'Renew subscription failed'))
    } finally {
      setRenewing(false)
    }
  }

  return (
    <PageCard title="Subscription">
      <div className="space-y-3">
        <p className="text-sm text-slate-700">
          Status: <span className="font-semibold">{status}</span>
        </p>
        {expiresAt && (
          <p className="text-sm text-slate-600">Expires at: {new Date(expiresAt).toLocaleString()}</p>
        )}
        <AlertBox message={error} />
        <AlertBox message={success} tone="success" />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={checkStatus}
            disabled={checking}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
          >
            {checking ? 'Checking...' : 'Check Status'}
          </button>
          <button
            type="button"
            onClick={handleRenew}
            disabled={renewing}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {renewing ? 'Renewing...' : 'Renew Subscription'}
          </button>
        </div>
      </div>
    </PageCard>
  )
}

export default SubscriptionPage
