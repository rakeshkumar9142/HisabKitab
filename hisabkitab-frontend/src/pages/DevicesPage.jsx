import { useCallback, useEffect, useState } from 'react'
import AlertBox from '../components/AlertBox.jsx'
import PageCard from '../components/PageCard.jsx'
import { disableDevice, getDevices, registerDevice } from '../services/deviceService.js'
import { getErrorMessage } from '../services/api.js'

function DevicesPage() {
  const [name, setName] = useState('')
  const [devices, setDevices] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [newDeviceToken, setNewDeviceToken] = useState('')
  const [loadingList, setLoadingList] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [disablingId, setDisablingId] = useState('')

  const loadDevices = useCallback(async () => {
    setLoadingList(true)
    setError('')
    try {
      const data = await getDevices()
      setDevices(data)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load devices'))
    } finally {
      setLoadingList(false)
    }
  }, [])

  useEffect(() => {
    loadDevices()
  }, [loadDevices])

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setNewDeviceToken('')
    setRegistering(true)
    try {
      const data = await registerDevice({ name })
      setSuccess('Device registered successfully — copy the token to Profile → Print bridge for printing.')
      setNewDeviceToken(data.deviceToken)
      setName('')
      loadDevices()
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to register device'))
    } finally {
      setRegistering(false)
    }
  }

  const handleDisable = async (id) => {
    setError('')
    setSuccess('')
    setDisablingId(id)
    try {
      await disableDevice(id)
      setSuccess('Device disabled')
      loadDevices()
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to disable device'))
    } finally {
      setDisablingId('')
    }
  }

  return (
    <>
      <PageCard title="Register New Device">
        <form onSubmit={handleRegister} className="space-y-3">
          <AlertBox message={error} />
          <AlertBox message={success} tone="success" />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Device name (e.g., Counter 1)"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            required
          />
          <button
            type="submit"
            disabled={registering}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {registering ? 'Registering…' : 'Register Device'}
          </button>
          {newDeviceToken && (
            <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
              New device token: <span className="font-mono">{newDeviceToken}</span>
            </p>
          )}
        </form>
      </PageCard>

      <PageCard title="Active Devices">
        <div className="space-y-2">
          {loadingList ? (
            <p className="text-sm text-slate-500">Loading devices…</p>
          ) : devices.length === 0 ? (
            <p className="text-sm text-slate-500">No active devices found.</p>
          ) : (
            devices.map((device) => (
              <div key={device._id} className="rounded-lg border border-slate-200 p-3">
                <p className="font-medium text-slate-800">{device.name}</p>
                <p className="text-xs text-slate-500">Created: {new Date(device.createdAt).toLocaleString()}</p>
                <button
                  type="button"
                  onClick={() => handleDisable(device._id)}
                  disabled={Boolean(disablingId)}
                  className="mt-2 rounded-md bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700 disabled:opacity-50"
                >
                  {disablingId === device._id ? 'Disabling…' : 'Disable Device'}
                </button>
              </div>
            ))
          )}
        </div>
      </PageCard>
    </>
  )
}

export default DevicesPage
