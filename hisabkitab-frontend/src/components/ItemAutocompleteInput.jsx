import { forwardRef, useEffect, useId, useMemo, useState } from 'react'

function normalize(str) {
  return String(str ?? '').toLowerCase().trim()
}

const ItemAutocompleteInput = forwardRef(function ItemAutocompleteInput(
  {
    items,
    value,
    onValueChange,
    onSelectItem,
    onTabToQuantity,
    placeholder = 'Type item name',
    disabled = false,
  },
  ref,
) {
  const listboxId = useId()
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const filteredItems = useMemo(() => {
    const q = normalize(value)
    if (!q) return []
    return items
      .filter((item) => normalize(item.name).includes(q))
      .slice(0, 10)
  }, [items, value])

  useEffect(() => {
    // Avoid cascading renders from immediate setState during effects.
    const t = setTimeout(() => setActiveIndex(0), 0)
    return () => clearTimeout(t)
  }, [value])

  useEffect(() => {
    if (!open) return

    const onDocMouseDown = (e) => {
      const target = e.target
      if (!(target instanceof HTMLElement)) return

      // Close if click is outside this component.
      if (!target.closest(`[data-autocomplete-root="${listboxId}"]`)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [open, listboxId])

  const handleSelect = (item) => {
    if (!item) return
    onSelectItem(item)
    setOpen(false)
  }

  return (
    <div data-autocomplete-root={listboxId} className="relative col-span-7">
      <input
        ref={ref}
        value={value}
        disabled={disabled}
        onChange={(e) => {
          onValueChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => {
          if (normalize(value)) setOpen(true)
        }}
        onKeyDown={(e) => {
          if (disabled) return

          if (e.key === 'ArrowDown') {
            e.preventDefault()
            if (!filteredItems.length) return
            setOpen(true)
            setActiveIndex((prev) => (prev + 1) % filteredItems.length)
            return
          }

          if (e.key === 'ArrowUp') {
            e.preventDefault()
            if (!filteredItems.length) return
            setOpen(true)
            setActiveIndex((prev) =>
              prev - 1 < 0 ? filteredItems.length - 1 : prev - 1,
            )
            return
          }

          if (e.key === 'Enter') {
            // Prevent form submit; selection is handled here.
            e.preventDefault()
            if (open && filteredItems.length) {
              handleSelect(filteredItems[activeIndex])
            } else if (filteredItems.length) {
              handleSelect(filteredItems[0])
            }
            return
          }

          if (e.key === 'Tab') {
            setOpen(false)
            if (onTabToQuantity) {
              e.preventDefault()
              onTabToQuantity()
            }
          }
        }}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none focus:border-blue-500"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
      />

      {open && filteredItems.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
        >
          {filteredItems.map((item, idx) => {
            const isActive = idx === activeIndex
            return (
              <li
                key={item._id}
                role="option"
                aria-selected={isActive}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(item)}
                className={`cursor-pointer px-2 py-2 text-sm ${
                  isActive ? 'bg-blue-50' : 'bg-white'
                }`}
              >
                <span className="font-medium">{item.name}</span>
                <span className="ml-1 text-slate-500">
                  (Rs {Number(item.price).toFixed(2)})
                </span>
              </li>
            )
          })}
        </ul>
      )}

      {open && !filteredItems.length && normalize(value) && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-500 shadow-sm">
          No matches
        </div>
      )}
    </div>
  )
})

export default ItemAutocompleteInput

