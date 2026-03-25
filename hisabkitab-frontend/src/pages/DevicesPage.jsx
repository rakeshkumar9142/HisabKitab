import { useEffect, useState } from 'react'
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

  const loadDevices = async () => {
    try {
      const data = await getDevices()
      setDevices(data)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load devices'))
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      loadDevices()
    }, 0)
    return () => clearTimeout(t)
  }, [])

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setNewDeviceToken('')
    try {
      const data = await registerDevice({ name })
      setSuccess('Device registered successfully')
      setNewDeviceToken(data.deviceToken)
      setName('')
      loadDevices()
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to register device'))
    }
  }

  const handleDisable = async (id) => {
    setError('')
    setSuccess('')
    try {
      await disableDevice(id)
      setSuccess('Device disabled')
      loadDevices()
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to disable device'))
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
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">
            Register Device
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
          {devices.length === 0 ? (
            <p className="text-sm text-slate-500">No active devices found.</p>
          ) : (
            devices.map((device) => (
              <div key={device._id} className="rounded-lg border border-slate-200 p-3">
                <p className="font-medium text-slate-800">{device.name}</p>
                <p className="text-xs text-slate-500">Created: {new Date(device.createdAt).toLocaleString()}</p>
                <button
                  type="button"
                  onClick={() => handleDisable(device._id)}
                  className="mt-2 rounded-md bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700"
                >
                  Disable Device
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
