import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AlertBox from '../components/AlertBox.jsx'
import ItemSearchCombobox from '../components/ItemSearchCombobox.jsx'
import PageCard from '../components/PageCard.jsx'
import QuickAddItemModal from '../components/QuickAddItemModal.jsx'
import { createBill } from '../services/billService.js'
import { getErrorMessage } from '../services/api.js'
import { getItems } from '../services/itemService.js'
import { getPrintDeviceToken, printReceipt } from '../services/printService.js'

const PAYMENT_METHODS = ['cash', 'upi', 'card']

function getItemById(catalog, id) {
  return catalog.find((x) => String(x._id) === String(id))
}

function stockIssue(item, qty) {
  if (typeof item?.stock !== 'number' || !Number.isFinite(item.stock)) return null
  if (qty > item.stock) return `Only ${item.stock} in stock`
  return null
}

function BillingPage() {
  const [catalog, setCatalog] = useState([])
  const [rows, setRows] = useState([{ itemId: '', quantity: 1 }])
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [quickAddRowIndex, setQuickAddRowIndex] = useState(null)
  const [printLoading, setPrintLoading] = useState(false)
  const [printMessage, setPrintMessage] = useState('')
  const [printError, setPrintError] = useState('')

  const searchRefs = useRef([])
  const qtyRefs = useRef([])
  const didAutoFocusSearch = useRef(false)

  const loadItems = useCallback(async () => {
    try {
      const data = await getItems()
      setCatalog(data)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to fetch items for billing'))
    }
  }, [])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  useEffect(() => {
    if (didAutoFocusSearch.current || catalog.length === 0) return
    didAutoFocusSearch.current = true
    queueMicrotask(() => searchRefs.current[0]?.focus())
  }, [catalog.length])

  useEffect(() => {
    searchRefs.current = searchRefs.current.slice(0, rows.length)
    qtyRefs.current = qtyRefs.current.slice(0, rows.length)
  }, [rows.length])

  const openQuickAdd = (rowIndex) => {
    setQuickAddRowIndex(rowIndex)
    setQuickAddOpen(true)
  }

  const closeQuickAdd = () => {
    setQuickAddOpen(false)
    setQuickAddRowIndex(null)
  }

  const updateRow = (index, patch) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  const handleQuickAddCreated = async (item) => {
    const rowIdx = quickAddRowIndex
    await loadItems()
    if (rowIdx != null && item?._id) {
      updateRow(rowIdx, { itemId: item._id })
    }
  }

  const estimatedTotal = useMemo(() => {
    return rows.reduce((sum, row) => {
      const item = getItemById(catalog, row.itemId)
      if (!item) return sum
      return sum + Number(item.price) * Number(row.quantity || 0)
    }, 0)
  }, [catalog, rows])

  const addRowAndFocusSearch = useCallback(() => {
    setRows((prev) => {
      const next = [...prev, { itemId: '', quantity: 1 }]
      const idx = next.length - 1
      queueMicrotask(() => searchRefs.current[idx]?.focus())
      return next
    })
  }, [])

  const addRow = () => {
    setRows((prev) => [...prev, { itemId: '', quantity: 1 }])
  }

  const removeRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  const handleQtyKeyDown = (e, index) => {
    if (e.key !== 'Enter' || e.shiftKey) return
    e.preventDefault()
    addRowAndFocusSearch()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setPrintMessage('')
    setPrintError('')

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

    for (const line of validItems) {
      const item = getItemById(catalog, line.itemId)
      const msg = stockIssue(item, line.quantity)
      if (msg) {
        setError(`${item?.name || 'Item'}: ${msg}`)
        return
      }
    }

    setLoading(true)
    try {
      const bill = await createBill({ items: validItems, paymentMethod })
      setResult(bill)
      setRows([{ itemId: '', quantity: 1 }])
      queueMicrotask(() => searchRefs.current[0]?.focus())
      await loadItems()
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to generate bill'))
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = async () => {
    setPrintMessage('')
    setPrintError('')
    const deviceToken = getPrintDeviceToken()
    if (!deviceToken) {
      setPrintError('Save a print device token in Profile first.')
      return
    }
    if (!result?.receiptText) return

    setPrintLoading(true)
    try {
      await printReceipt({ deviceToken, receiptText: result.receiptText })
      setPrintMessage('Printed successfully')
    } catch (err) {
      setPrintError(getErrorMessage(err, 'Print failed. Is the bridge running on 127.0.0.1:8080?'))
    } finally {
      setPrintLoading(false)
    }
  }

  return (
    <>
      <PageCard title="Create Bill">
        <form onSubmit={handleSubmit} className="space-y-4">
          <AlertBox message={error} />

          {rows.map((row, index) => {
            const item = getItemById(catalog, row.itemId)
            const qty = Number(row.quantity) || 0
            const stockWarn = item ? stockIssue(item, qty) : null

            return (
              <div key={index} className="space-y-2 rounded-lg border border-slate-100 p-2">
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-12 sm:col-span-7">
                    <ItemSearchCombobox
                      ref={(el) => {
                        searchRefs.current[index] = el
                      }}
                      items={catalog}
                      value={row.itemId}
                      onValueChange={(id) => updateRow(index, { itemId: id })}
                      onEnterClosed={() => qtyRefs.current[index]?.focus()}
                      id={`bill-item-${index}`}
                    />
                  </div>
                  <input
                    ref={(el) => {
                      qtyRefs.current[index] = el
                    }}
                    type="number"
                    value={row.quantity}
                    onChange={(e) => updateRow(index, { quantity: e.target.value })}
                    min="1"
                    inputMode="numeric"
                    aria-label={`Quantity row ${index + 1}`}
                    onKeyDown={(e) => handleQtyKeyDown(e, index)}
                    className="col-span-6 rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none focus:border-blue-500 sm:col-span-3"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    disabled={rows.length === 1}
                    className="col-span-6 rounded-lg border border-slate-300 px-2 py-2 text-xs text-slate-600 disabled:opacity-40 sm:col-span-2"
                  >
                    Remove
                  </button>
                </div>
                {stockWarn && <p className="text-xs font-medium text-amber-700">{stockWarn}</p>}
                <button
                  type="button"
                  onClick={() => openQuickAdd(index)}
                  className="text-sm font-medium text-blue-600"
                >
                  + Add New Item
                </button>
              </div>
            )
          })}

          <button
            type="button"
            onClick={addRow}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
          >
            + Add Item Row
          </button>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <select
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
            {loading ? 'Generating Bill…' : 'Generate Bill'}
          </button>
        </form>
      </PageCard>

      {result && (
        <PageCard title={`Bill Created: ${result.billId}`}>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700">Total Amount: Rs {result.totalAmount}</p>
            <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs whitespace-pre-wrap text-slate-100">
              {result.receiptText}
            </pre>
            <AlertBox message={printError} />
            <AlertBox message={printMessage} tone="success" />
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handlePrint}
                disabled={printLoading}
                className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {printLoading ? 'Printing…' : 'Print Bill'}
              </button>
              {!getPrintDeviceToken() && (
                <Link to="/app/profile" className="self-center text-sm font-medium text-blue-600">
                  Set print token in Profile
                </Link>
              )}
            </div>
          </div>
        </PageCard>
      )}

      <QuickAddItemModal open={quickAddOpen} onClose={closeQuickAdd} onCreated={handleQuickAddCreated} />
    </>
  )
}

export default BillingPage
