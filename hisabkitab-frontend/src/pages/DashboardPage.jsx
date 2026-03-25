import { useEffect, useMemo, useState } from 'react'
import PageCard from '../components/PageCard.jsx'
import { getBills } from '../services/billService.js'
import { getDevices } from '../services/deviceService.js'
import { getItems } from '../services/itemService.js'
import AlertBox from '../components/AlertBox.jsx'

function getLocalISODate(d) {
  const dt = new Date(d)
  const year = dt.getFullYear()
  const month = String(dt.getMonth() + 1).padStart(2, '0')
  const day = String(dt.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(baseDate, deltaDays) {
  const d = new Date(baseDate)
  d.setDate(d.getDate() + deltaDays)
  return d
}

function SalesBarsChart({ values }) {
  const max = Math.max(...values.map((v) => v.value), 0.0001)

  return (
    <div className="mt-2">
      <div className="flex items-end gap-2">
        {values.map((v) => {
          const pct = (v.value / max) * 100
          return (
            <div key={v.key} className="flex-1">
              <div
                className="h-28 w-full rounded-md bg-blue-50 ring-1 ring-blue-100"
                aria-label={`${v.label}: Rs ${v.value.toFixed(2)}`}
              >
                <div
                  className="w-full rounded-md bg-blue-200"
                  style={{ height: `${Math.max(6, pct)}%` }}
                  title={`Rs ${v.value.toFixed(2)}`}
                />
              </div>
              <div className="mt-2 text-center text-[11px] text-slate-600">
                {v.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DashboardPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])
  const [bills, setBills] = useState([])
  const [devices, setDevicesState] = useState([])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [itemsData, billsData, devicesData] = await Promise.all([
          getItems(),
          getBills(),
          getDevices(),
        ])
        setItems(itemsData)
        setBills(billsData)
        setDevicesState(devicesData)
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const derived = useMemo(() => {
    const todayKey = getLocalISODate(new Date())

    const dayKeys = Array.from({ length: 7 }).map((_, idx) => {
      const d = addDays(new Date(), idx - 6)
      return getLocalISODate(d)
    })

    const todaySales = bills
      .filter((b) => getLocalISODate(b.createdAt) === todayKey)
      .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0)

    const todayBillsCount = bills.filter(
      (b) => getLocalISODate(b.createdAt) === todayKey,
    ).length

    const totalItems = items.length
    const activeDevices = devices.filter((d) => d.isActive !== false).length

    const salesByDay = new Map(dayKeys.map((k) => [k, 0]))
    bills.forEach((b) => {
      const key = getLocalISODate(b.createdAt)
      if (!salesByDay.has(key)) return
      salesByDay.set(key, salesByDay.get(key) + Number(b.totalAmount || 0))
    })

    const chartValues = dayKeys.map((k) => {
      const dt = new Date(`${k}T00:00:00`)
      const label = dt.toLocaleDateString(undefined, { weekday: 'short' })
      return { key: k, label, value: salesByDay.get(k) ?? 0 }
    })

    return {
      todayKey,
      todaySales,
      todayBillsCount,
      totalItems,
      activeDevices,
      chartValues,
    }
  }, [bills, items.length, devices])

  return (
    <PageCard title="Dashboard">
      <div className="space-y-3">
        <AlertBox message={error} />

        {loading && (
          <div className="text-sm text-slate-600">Loading dashboard...</div>
        )}

        {!loading && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="text-xs text-slate-600">Today&apos;s Sales</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">
                  Rs {derived.todaySales.toFixed(2)}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="text-xs text-slate-600">Total Bills Today</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">
                  {derived.todayBillsCount}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="text-xs text-slate-600">Total Items</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">
                  {derived.totalItems}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="text-xs text-slate-600">Active Devices</div>
                <div className="mt-1 text-lg font-semibold text-slate-900">
                  {derived.activeDevices}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-3">
              <div className="text-sm font-semibold text-slate-800">
                Last 7 Days Sales
              </div>
              <SalesBarsChart values={derived.chartValues} />
            </div>
          </>
        )}
      </div>
    </PageCard>
  )
}

export default DashboardPage

