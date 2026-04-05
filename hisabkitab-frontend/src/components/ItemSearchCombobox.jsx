import { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'

function isLowStock(item) {
  if (typeof item.stock !== 'number' || !Number.isFinite(item.stock)) return false
  const threshold =
    typeof item.lowStockThreshold === 'number' && Number.isFinite(item.lowStockThreshold)
      ? item.lowStockThreshold
      : 5
  return item.stock <= threshold
}

const ItemSearchCombobox = forwardRef(function ItemSearchCombobox(
  {
    items,
    value,
    onValueChange,
    disabled,
    className = '',
    id,
    placeholder = 'Search item…',
    onKeyDown: onKeyDownProp,
    /** When list is closed and an item is selected, Enter moves focus (e.g. to quantity). */
    onEnterClosed,
  },
  ref,
) {
  const listId = useId()
  const containerRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const [text, setText] = useState('')

  const selected = useMemo(() => items.find((i) => String(i._id) === String(value)), [items, value])

  useEffect(() => {
    if (selected) setText(selected.name)
    else if (!value) setText('')
  }, [selected, value])

  const filtered = useMemo(() => {
    const q = text.trim().toLowerCase()
    if (!q) return items.slice(0, 25)
    return items.filter((i) => i.name.toLowerCase().includes(q)).slice(0, 40)
  }, [items, text])

  useEffect(() => {
    if (highlight >= filtered.length) setHighlight(Math.max(0, filtered.length - 1))
  }, [filtered.length, highlight])

  const pick = useCallback(
    (item) => {
      onValueChange(item._id)
      setText(item.name)
      setOpen(false)
      setHighlight(0)
    },
    [onValueChange],
  )

  const handleInputChange = (e) => {
    const v = e.target.value
    setText(v)
    setOpen(true)
    setHighlight(0)
    if (selected && v !== selected.name) onValueChange('')
  }

  const handleInputFocus = () => {
    setOpen(true)
  }

  const handleInputBlur = () => {
    window.setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setOpen(false)
        if (selected) setText(selected.name)
      }
    }, 120)
  }

  const handleKeyDown = (e) => {
    onKeyDownProp?.(e)
    if (e.defaultPrevented) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      if (!filtered.length) return
      setHighlight((h) => Math.min(filtered.length - 1, h + 1))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
      if (!filtered.length) return
      setHighlight((h) => Math.max(0, h - 1))
      return
    }
    if (e.key === 'Enter') {
      if (open && filtered.length > 0) {
        e.preventDefault()
        const item = filtered[Math.min(highlight, filtered.length - 1)]
        if (item) pick(item)
        return
      }
      if (!open && value) {
        e.preventDefault()
        onEnterClosed?.()
      }
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      if (selected) setText(selected.name)
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        ref={ref}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        disabled={disabled}
        value={text}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
      />
      {open && filtered.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {filtered.map((item, idx) => {
            const low = isLowStock(item)
            const active = idx === highlight
            return (
              <li
                key={item._id}
                role="option"
                aria-selected={active}
                className={`cursor-pointer px-3 py-2 text-sm ${active ? 'bg-blue-50' : ''}`}
                onMouseDown={(ev) => ev.preventDefault()}
                onMouseEnter={() => setHighlight(idx)}
                onClick={() => pick(item)}
              >
                <span className="font-medium text-slate-800">{item.name}</span>
                <span className="text-slate-500"> · Rs {item.price}</span>
                {typeof item.stock === 'number' && Number.isFinite(item.stock) && (
                  <span className={low ? 'ml-1 text-amber-600' : 'ml-1 text-slate-400'}>
                    {' '}
                    · Stock {item.stock}
                    {low ? ' (low)' : ''}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
})

export default ItemSearchCombobox
