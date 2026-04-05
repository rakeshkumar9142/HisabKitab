import { useEffect, useState } from 'react'
import AlertBox from '../components/AlertBox.jsx'
import PageCard from '../components/PageCard.jsx'
import { getErrorMessage } from '../services/api.js'
import { getBills } from '../services/billService.js'

function BillsHistoryPage() {
  const [bills, setBills] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBills = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await getBills()
        setBills(data)
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load bills history'))
      } finally {
        setLoading(false)
      }
    }
    loadBills()
  }, [])

  return (
    <PageCard title="Bills History">
      <div className="space-y-3">
        <AlertBox message={error} />
        {loading ? (
          <p className="text-sm text-slate-500">Loading bills…</p>
        ) : bills.length === 0 ? (
          <p className="text-sm text-slate-500">No bills yet.</p>
        ) : (
          bills.map((bill) => (
            <div key={bill._id} className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-semibold text-slate-800">Total: Rs {Number(bill.totalAmount).toFixed(2)}</p>
              <p className="text-xs text-slate-500">
                Date: {new Date(bill.createdAt).toLocaleString()} | Payment: {bill.paymentMethod}
              </p>
            </div>
          ))
        )}
      </div>
    </PageCard>
  )
}

export default BillsHistoryPage
