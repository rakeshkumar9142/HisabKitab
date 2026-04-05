import { useCallback, useEffect, useState } from 'react'
import AlertBox from '../components/AlertBox.jsx'
import PageCard from '../components/PageCard.jsx'
import { createItem, deleteItem, getItems, updateItem } from '../services/itemService.js'
import { getErrorMessage } from '../services/api.js'

const initialForm = { name: '', price: '', unit: 'pcs', stock: '', lowStockThreshold: '' }

function isLowStock(item) {
  if (typeof item.stock !== 'number' || !Number.isFinite(item.stock)) return false
  const threshold =
    typeof item.lowStockThreshold === 'number' && Number.isFinite(item.lowStockThreshold)
      ? item.lowStockThreshold
      : 5
  return item.stock <= threshold
}

function ItemsPage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loadingList, setLoadingList] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState('')

  const loadItems = useCallback(async () => {
    setError('')
    setLoadingList(true)
    try {
      const data = await getItems()
      setItems(data)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load items'))
    } finally {
      setLoadingList(false)
    }
  }, [])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const resetForm = () => {
    setForm(initialForm)
    setEditingId('')
  }

  const buildPayload = () => {
    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      unit: (form.unit || 'pcs').trim() || 'pcs',
    }
    if (form.stock !== '' && form.stock != null) {
      const s = Number(form.stock)
      if (!Number.isFinite(s) || s < 0) throw new Error('Stock must be a number ≥ 0')
      payload.stock = s
    } else if (editingId) {
      payload.stock = ''
    }
    if (form.lowStockThreshold !== '' && form.lowStockThreshold != null) {
      const t = Number(form.lowStockThreshold)
      if (!Number.isFinite(t) || t < 0) throw new Error('Low stock threshold must be ≥ 0')
      payload.lowStockThreshold = t
    } else if (editingId) {
      payload.lowStockThreshold = ''
    }
    return payload
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    let payload
    try {
      payload = buildPayload()
    } catch (err) {
      setError(err.message)
      return
    }
    if (!payload.name) {
      setError('Item name is required.')
      return
    }
    if (!Number.isFinite(payload.price) || payload.price <= 0) {
      setError('Price must be greater than 0.')
      return
    }

    setSaving(true)
    try {
      if (editingId) {
        await updateItem(editingId, payload)
        setSuccess('Item updated successfully')
      } else {
        await createItem(payload)
        setSuccess('Item created successfully')
      }
      resetForm()
      loadItems()
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to save item'))
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (item) => {
    setEditingId(item._id)
    setForm({
      name: item.name,
      price: String(item.price),
      unit: item.unit || 'pcs',
      stock: typeof item.stock === 'number' ? String(item.stock) : '',
      lowStockThreshold:
        typeof item.lowStockThreshold === 'number' ? String(item.lowStockThreshold) : '',
    })
  }

  const handleDelete = async (id) => {
    setError('')
    setSuccess('')
    setDeletingId(id)
    try {
      await deleteItem(id)
      setSuccess('Item deleted')
      loadItems()
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to delete item'))
    } finally {
      setDeletingId('')
    }
  }

  return (
    <>
      <PageCard title={editingId ? 'Edit Item' : 'Add Item'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <AlertBox message={error} />
          <AlertBox message={success} tone="success" />
          <input
            name="name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Item name"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
              placeholder="Price"
              min="0"
              step="0.01"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
              required
            />
            <input
              name="unit"
              value={form.unit}
              onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))}
              placeholder="Unit (pcs/kg/litre)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
              placeholder="Stock (optional)"
              min="0"
              step="1"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            />
            <input
              type="number"
              name="lowStockThreshold"
              value={form.lowStockThreshold}
              onChange={(e) => setForm((prev) => ({ ...prev, lowStockThreshold: e.target.value }))}
              placeholder="Low stock at (optional)"
              min="0"
              step="1"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>
          <p className="text-xs text-slate-500">
            Leave stock empty if you do not track quantity. Bills only reduce stock when a number is set.
          </p>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {saving ? 'Saving…' : editingId ? 'Update Item' : 'Add Item'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </PageCard>

      <PageCard title="Items List">
        <div className="space-y-2">
          {loadingList ? (
            <p className="text-sm text-slate-500">Loading items…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-500">No items found.</p>
          ) : (
            items.map((item) => {
              const low = isLowStock(item)
              return (
                <div
                  key={item._id}
                  className={`rounded-lg border p-3 ${low ? 'border-amber-300 bg-amber-50/50' : 'border-slate-200'}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-800">{item.name}</p>
                      <p className="text-sm text-slate-600">
                        Rs {Number(item.price).toFixed(2)} / {item.unit}
                      </p>
                      {typeof item.stock === 'number' && Number.isFinite(item.stock) ? (
                        <p className={`mt-1 text-sm font-medium ${low ? 'text-amber-800' : 'text-slate-700'}`}>
                          Stock: {item.stock}
                          {low ? ' · Low stock' : ''}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-slate-500">Stock not tracked</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        disabled={saving || Boolean(deletingId)}
                        className="rounded-md bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        disabled={saving || deletingId === item._id}
                        className="rounded-md bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700 disabled:opacity-50"
                      >
                        {deletingId === item._id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </PageCard>
    </>
  )
}

export default ItemsPage
