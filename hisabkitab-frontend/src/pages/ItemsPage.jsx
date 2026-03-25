import { useEffect, useState } from 'react'
import AlertBox from '../components/AlertBox.jsx'
import PageCard from '../components/PageCard.jsx'
import { createItem, deleteItem, getItems, updateItem } from '../services/itemService.js'
import { getErrorMessage } from '../services/api.js'

const initialForm = { name: '', price: '', unit: 'pcs', stock: '', lowStockThreshold: '' }

function ItemsPage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadItems = async () => {
    try {
      const data = await getItems()
      setItems(data)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load items'))
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  const resetForm = () => {
    setForm(initialForm)
    setEditingId('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      const priceNum = Number(form.price)
      if (!Number.isFinite(priceNum) || priceNum <= 0) {
        setError('Price must be greater than 0.')
        return
      }

      const stockNum =
        form.stock === '' ? undefined : Number(form.stock)
      const lowStockNum =
        form.lowStockThreshold === '' ? undefined : Number(form.lowStockThreshold)

      if (stockNum !== undefined && (!Number.isFinite(stockNum) || stockNum < 0)) {
        setError('Stock must be 0 or greater.')
        return
      }
      if (
        lowStockNum !== undefined &&
        (!Number.isFinite(lowStockNum) || lowStockNum < 0)
      ) {
        setError('Low stock threshold must be 0 or greater.')
        return
      }

      const payload = {
        name: form.name,
        price: priceNum,
        unit: form.unit,
        ...(stockNum === undefined ? {} : { stock: stockNum }),
        ...(lowStockNum === undefined ? {} : { lowStockThreshold: lowStockNum }),
      }

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
      setSubmitting(false)
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
        typeof item.lowStockThreshold === 'number'
          ? String(item.lowStockThreshold)
          : '',
    })
  }

  const handleDelete = async (id) => {
    setError('')
    setSuccess('')
    try {
      await deleteItem(id)
      setSuccess('Item deleted')
      loadItems()
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to delete item'))
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
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  lowStockThreshold: e.target.value,
                }))
              }
              placeholder="Low stock threshold (optional)"
              min="0"
              step="1"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {editingId ? 'Update Item' : 'Add Item'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={submitting}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </PageCard>

      <PageCard title="Items List">
        <div className="space-y-2">
          {items.length === 0 ? (
            <p className="text-sm text-slate-500">No items found.</p>
          ) : (
            items.map((item) => (
              <div
                key={item._id}
                className={`rounded-lg border p-3 ${
                  typeof item.stock === 'number' &&
                  typeof item.lowStockThreshold === 'number' &&
                  item.stock <= item.lowStockThreshold
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <p className="font-medium text-slate-800">{item.name}</p>
                <p className="text-sm text-slate-600">
                  Rs {Number(item.price).toFixed(2)} / {item.unit}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Stock:{' '}
                  {typeof item.stock === 'number' ? item.stock : '—'}
                  {typeof item.lowStockThreshold === 'number' &&
                    ` (Low <= ${item.lowStockThreshold})`}
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="rounded-md bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    className="rounded-md bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </PageCard>
    </>
  )
}

export default ItemsPage
