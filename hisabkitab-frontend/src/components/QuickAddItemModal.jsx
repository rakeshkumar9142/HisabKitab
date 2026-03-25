import { useEffect, useState } from 'react'
import AlertBox from './AlertBox.jsx'
import { getErrorMessage } from '../services/api.js'

function QuickAddItemModal({ open, onClose, onCreate, submitting = false }) {
  const [form, setForm] = useState({ name: '', price: '', unit: 'pcs' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => {
      setForm({ name: '', price: '', unit: 'pcs' })
      setError('')
    }, 0)
    return () => clearTimeout(t)
  }, [open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const name = form.name.trim()
    const priceNum = Number(form.price)
    const unit = (form.unit || '').trim() || 'pcs'

    if (!name) {
      setError('Item name is required.')
      return
    }
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setError('Price must be greater than 0.')
      return
    }

    try {
      await onCreate({ name, price: priceNum, unit })
      onClose()
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to add item'))
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h3 className="text-base font-semibold text-slate-800">Add New Item</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 px-4 py-4">
          <AlertBox message={error} />

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Item Name</span>
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Aata"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              required
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Price</span>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                placeholder="e.g., 45"
                min="0"
                step="0.01"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Unit</span>
              <input
                value={form.unit}
                onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))}
                placeholder="pcs/kg/litre"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {submitting ? 'Adding...' : 'Add Item'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuickAddItemModal

