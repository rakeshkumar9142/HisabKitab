import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageCard from '../components/PageCard.jsx'
import AlertBox from '../components/AlertBox.jsx'
import SalesChart7 from '../components/SalesChart7.jsx'
import { getBills } from '../services/billService.js'
import { getItems } from '../services/itemService.js'
import { getDevices } from '../services/deviceService.js'
import { getErrorMessage } from '../services/api.js'

function startOfLocalDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function formatDayKey(d) {
  const x = new Date(d)
  const y = x.getFullYear()
  const m = String(x.getMonth() + 1).padStart(2, '0')
  const day = String(x.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function DashboardPage() {
  const [bills, setBills] = useState([])
  const [itemsCount, setItemsCount] = useState(0)
  const [devicesCount, setDevicesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const [billsData, itemsData, devicesData] = await Promise.all([getBills(), getItems(), getDevices()])
      setBills(Array.isArray(billsData) ? billsData : [])
      setItemsCount(Array.isArray(itemsData) ? itemsData.length : 0)
      setDevicesCount(Array.isArray(devicesData) ? devicesData.length : 0)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load dashboard'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const todayStats = useMemo(() => {
    const start = startOfLocalDay(new Date())
    const end = new Date(start)
    end.setDate(end.getDate() + 1)

    let total = 0
    let count = 0
    for (const b of bills) {
      const t = new Date(b.createdAt)
      if (t >= start && t < end) {
        total += Number(b.totalAmount) || 0
        count += 1
      }
    }
    return { total, count }
  }, [bills])

  const chartSeries = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push(startOfLocalDay(d))
    }

    const totals = new Map()
    days.forEach((d) => totals.set(formatDayKey(d), 0))

    for (const b of bills) {
      const key = formatDayKey(b.createdAt)
      if (totals.has(key)) {
        totals.set(key, totals.get(key) + (Number(b.totalAmount) || 0))
      }
    }

    return days.map((d) => {
      const key = formatDayKey(d)
      const weekday = d.toLocaleDateString(undefined, { weekday: 'short' })
      return {
        key,
        label: d.toLocaleDateString(),
        shortLabel: weekday,
        total: totals.get(key) || 0,
      }
    })
  }, [bills])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-800">Dashboard</h2>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <AlertBox message={error} />

      <div className="grid grid-cols-2 gap-3">
        <PageCard title="Today's sales">
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : (
            <p className="text-2xl font-bold text-slate-900">Rs {todayStats.total.toFixed(2)}</p>
          )}
        </PageCard>
        <PageCard title="Bills today">
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : (
            <p className="text-2xl font-bold text-slate-900">{todayStats.count}</p>
          )}
        </PageCard>
        <PageCard title="Items in catalog">
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : (
            <p className="text-2xl font-bold text-slate-900">{itemsCount}</p>
          )}
        </PageCard>
        <PageCard title="Active devices">
          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : (
            <p className="text-2xl font-bold text-slate-900">{devicesCount}</p>
          )}
        </PageCard>
      </div>

      <PageCard title="Last 7 days sales">
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : (
          <>
            <SalesChart7 series={chartSeries} />
            <p className="mt-2 text-xs text-slate-500">
              Based on your latest bills from the server (up to 50 most recent). For busier shops, increase the API
              limit later.
            </p>
          </>
        )}
      </PageCard>

      <div className="flex flex-wrap gap-2">
        <Link
          to="/app/billing"
          className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
        >
          New bill
        </Link>
        <Link to="/app/items" className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">
          Manage items
        </Link>
      </div>
    </div>
  )
}

export default DashboardPage
