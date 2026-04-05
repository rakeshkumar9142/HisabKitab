import { useEffect, useState } from 'react'
import AlertBox from './AlertBox.jsx'
import { createItem } from '../services/itemService.js'
import { getErrorMessage } from '../services/api.js'

const initialForm = { name: '', price: '', unit: 'pcs', stock: '', lowStockThreshold: '' }

function QuickAddItemModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setForm(initialForm)
    setError('')
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const name = form.name.trim()
    if (!name) {
      setError('Item name is required.')
      return
    }

    const priceNum = Number(form.price)
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setError('Price must be greater than 0.')
      return
    }

    const unit = (form.unit || 'pcs').trim() || 'pcs'

    let stockPayload
    if (form.stock !== '' && form.stock != null) {
      const s = Number(form.stock)
      if (!Number.isFinite(s) || s < 0) {
        setError('Stock must be a number ≥ 0.')
        return
      }
      stockPayload = s
    }

    let lowPayload
    if (form.lowStockThreshold !== '' && form.lowStockThreshold != null) {
      const t = Number(form.lowStockThreshold)
      if (!Number.isFinite(t) || t < 0) {
        setError('Low stock threshold must be a number ≥ 0.')
        return
      }
      lowPayload = t
    }

    setSubmitting(true)
    try {
      const payload = { name, price: priceNum, unit }
      if (stockPayload !== undefined) payload.stock = stockPayload
      if (lowPayload !== undefined) payload.lowStockThreshold = lowPayload
      const item = await createItem(payload)
      if (onCreated) await onCreated(item)
      onClose()
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create item'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-add-item-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="w-full max-w-md rounded-t-2xl bg-white shadow-lg sm:rounded-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 id="quick-add-item-title" className="text-lg font-semibold text-slate-800">
            Add New Item
          </h2>
          <p className="text-xs text-slate-500">Saves to your catalog and selects it on this line.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 px-4 py-4">
          <AlertBox message={error} />

          <div>
            <label htmlFor="qa-name" className="mb-1 block text-xs font-medium text-slate-600">
              Name
            </label>
            <input
              id="qa-name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Sugar 1kg"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              autoComplete="off"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="qa-price" className="mb-1 block text-xs font-medium text-slate-600">
                Price
              </label>
              <input
                id="qa-price"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="qa-unit" className="mb-1 block text-xs font-medium text-slate-600">
                Unit (optional)
              </label>
              <input
                id="qa-unit"
                value={form.unit}
                onChange={(e) => setForm((p) => ({ ...p, unit: e.target.value }))}
                placeholder="pcs"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="qa-stock" className="mb-1 block text-xs font-medium text-slate-600">
                Stock (optional)
              </label>
              <input
                id="qa-stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
                placeholder="Track qty"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="qa-low" className="mb-1 block text-xs font-medium text-slate-600">
                Low at (optional)
              </label>
              <input
                id="qa-low"
                type="number"
                min="0"
                step="1"
                value={form.lowStockThreshold}
                onChange={(e) => setForm((p) => ({ ...p, lowStockThreshold: e.target.value }))}
                placeholder="e.g. 5"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 rounded-lg border border-slate-300 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Save item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuickAddItemModal
