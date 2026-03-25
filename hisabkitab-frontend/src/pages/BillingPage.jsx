import { useEffect, useMemo, useRef, useState } from 'react'
import AlertBox from '../components/AlertBox.jsx'
import PageCard from '../components/PageCard.jsx'
import { createBill } from '../services/billService.js'
import { getErrorMessage } from '../services/api.js'
import { createItem, getItems } from '../services/itemService.js'
import { getDevices } from '../services/deviceService.js'
import QuickAddItemModal from '../components/QuickAddItemModal.jsx'
import ItemAutocompleteInput from '../components/ItemAutocompleteInput.jsx'

const PAYMENT_METHODS = ['cash', 'upi', 'card']

function BillingPage() {
  const [catalog, setCatalog] = useState([])
  const [rows, setRows] = useState([{ itemId: '', quantity: 1, query: '' }])
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [quickAddSubmitting, setQuickAddSubmitting] = useState(false)

  const [deviceToken, setDeviceToken] = useState('')
  const [printing, setPrinting] = useState(false)
  const [printError, setPrintError] = useState('')
  const [printSuccess, setPrintSuccess] = useState('')

  const itemInputRefs = useRef({})
  const qtyInputRefs = useRef({})
  const paymentMethodRef = useRef(null)

  useEffect(() => {
    const loadCatalog = async () => {
      const data = await getItems()
      setCatalog(data)
      return data
    }

    loadCatalog().catch((err) => {
      setError(getErrorMessage(err, 'Failed to fetch items for billing'))
    })
  }, [])

  useEffect(() => {
    // Use last registered device for printing (local POS bridge needs it).
    const stored = localStorage.getItem('hisabkitab_print_device_token')
    if (stored) {
      setDeviceToken(stored)
      return
    }

    getDevices()
      .then((devs) => {
        const first = devs?.[0]
        if (first?.deviceToken) {
          localStorage.setItem('hisabkitab_print_device_token', first.deviceToken)
          setDeviceToken(first.deviceToken)
        }
      })
      .catch(() => {
        // Don't block billing if device lookup fails; user can register a device later.
      })
  }, [])

  const fetchItems = async () => {
    const data = await getItems()
    setCatalog(data)
    return data
  }

  const handleQuickAddCreate = async ({ name, price, unit }) => {
    setQuickAddSubmitting(true)
    try {
      const created = await createItem({ name, price, unit })
      await fetchItems()

      // Auto-select the new item in the first empty row (optional UX improvement).
      setRows((prev) => {
        const emptyIndex = prev.findIndex((r) => !r.itemId)
        if (emptyIndex === -1) return prev
        return prev.map((r, i) =>
          i === emptyIndex
            ? { ...r, itemId: created._id, query: created.name }
            : r,
        )
      })

      return created
    } finally {
      setQuickAddSubmitting(false)
    }
  }

  const estimatedTotal = useMemo(() => {
    return rows.reduce((sum, row) => {
      const item = catalog.find((x) => x._id === row.itemId)
      if (!item) return sum
      return sum + Number(item.price) * Number(row.quantity || 0)
    }, 0)
  }, [catalog, rows])

  const updateRow = (index, patch) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  const addRow = () => {
    setRows((prev) => [...prev, { itemId: '', quantity: 1, query: '' }])
  }

  const removeRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setPrintError('')
    setPrintSuccess('')

    const validItems = rows
      .filter((row) => row.itemId && Number(row.quantity) > 0)
      .map((row) => ({
        itemId: row.itemId,
        quantity: Number(row.quantity),
      }))

    if (!validItems.length) {
      setError('Please add at least one valid item with quantity.')
      return
    }

    setLoading(true)
    try {
      const bill = await createBill({ items: validItems, paymentMethod })
      setResult(bill)
      setRows([{ itemId: '', quantity: 1, query: '' }])
      setPrintError('')
      setPrintSuccess('')
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to generate bill'))
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = async () => {
    if (!deviceToken) {
      setPrintError('No device registered for printing. Register a device first.')
      setPrintSuccess('')
      return
    }

    if (!result?.receiptText) {
      setPrintError('No receipt text to print. Generate a bill first.')
      setPrintSuccess('')
      return
    }

    setPrinting(true)
    setPrintError('')
    setPrintSuccess('')
    try {
      const res = await fetch('http://127.0.0.1:8080/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceToken,
          receiptText: result.receiptText,
        }),
      })

      if (!res.ok) {
        const bodyText = await res.text().catch(() => '')
        throw new Error(bodyText || `Print failed (${res.status})`)
      }

      setPrintSuccess('Printed successfully')
    } catch (err) {
      setPrintError(err?.message || 'Failed to print')
    } finally {
      setPrinting(false)
    }
  }

  return (
    <>
      <PageCard title="Create Bill">
        <form onSubmit={handleSubmit} className="space-y-4">
          <AlertBox message={error} />

          {rows.map((row, index) => (
            <div key={index} className="grid grid-cols-12 gap-2">
              <ItemAutocompleteInput
                ref={(el) => {
                  itemInputRefs.current[index] = el
                }}
                items={catalog}
                value={row.query}
                onValueChange={(val) => updateRow(index, { itemId: '', query: val })}
                onSelectItem={(item) => {
                  updateRow(index, { itemId: item._id, query: item.name })
                  setTimeout(
                    () => qtyInputRefs.current[index]?.focus(),
                    0,
                  )
                }}
                onTabToQuantity={() => qtyInputRefs.current[index]?.focus()}
                placeholder="Item name"
              />
              <input
                ref={(el) => {
                  qtyInputRefs.current[index] = el
                }}
                type="number"
                value={row.quantity}
                onChange={(e) => updateRow(index, { quantity: e.target.value })}
                min="1"
                className="col-span-3 rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none focus:border-blue-500"
                inputMode="numeric"
                onFocus={(e) => e.target.select()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const nextIndex = index + 1
                    if (nextIndex >= rows.length) {
                      addRow()
                      setTimeout(
                        () => itemInputRefs.current[nextIndex]?.focus(),
                        0,
                      )
                    } else {
                      setTimeout(
                        () => itemInputRefs.current[nextIndex]?.focus(),
                        0,
                      )
                    }
                  }

                  if (e.key === 'Tab') {
                    e.preventDefault()
                    const nextIndex = index + 1
                    if (nextIndex >= rows.length) {
                      setTimeout(() => paymentMethodRef.current?.focus(), 0)
                    } else {
                      setTimeout(
                        () => itemInputRefs.current[nextIndex]?.focus(),
                        0,
                      )
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => removeRow(index)}
                disabled={rows.length === 1}
                className="col-span-2 rounded-lg border border-slate-300 px-2 py-2 text-xs text-slate-600 disabled:opacity-40"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="pt-1">
            <button
              type="button"
              onClick={() => setQuickAddOpen(true)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
            >
              + Add New Item
            </button>
          </div>

          <button
            type="button"
            onClick={addRow}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
          >
            + Add Item Row
          </button>

          <div className="grid grid-cols-2 gap-3">
            <select
              ref={paymentMethodRef}
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method.toUpperCase()}
                </option>
              ))}
            </select>
            <div className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
              Preview Total: Rs {estimatedTotal.toFixed(2)}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-60"
          >
            {loading ? 'Generating Bill...' : 'Generate Bill'}
          </button>
        </form>
      </PageCard>

      {result && (
        <PageCard title={`Bill Created: ${result.billId}`}>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700">
              Total Amount: Rs {result.totalAmount}
            </p>
            <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs whitespace-pre-wrap text-slate-100">
              {result.receiptText}
            </pre>

            <div className="space-y-2 pt-1">
              <AlertBox message={printError} />
              <AlertBox message={printSuccess} tone="success" />

              <button
                type="button"
                onClick={handlePrint}
                disabled={printing}
                className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white disabled:opacity-60"
              >
                {printing ? 'Printing...' : 'Print Bill'}
              </button>

              {!deviceToken && (
                <p className="text-xs text-slate-500">
                  Register/select a printing device in `Devices` first.
                </p>
              )}
            </div>
          </div>
        </PageCard>
      )}

      <QuickAddItemModal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onCreate={handleQuickAddCreate}
        submitting={quickAddSubmitting}
      />
    </>
  )
}

export default BillingPage
