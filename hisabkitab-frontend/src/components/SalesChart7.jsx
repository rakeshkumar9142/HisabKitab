function SalesChart7({ series }) {
  const max = Math.max(1, ...series.map((s) => s.total))

  return (
    <div className="flex h-40 items-end gap-1 pt-2">
      {series.map((day) => {
        const h = Math.round((day.total / max) * 100)
        return (
          <div key={day.key} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full flex-1 items-end justify-center">
              <div
                className="w-full max-w-[28px] rounded-t bg-blue-500/90"
                style={{ height: `${h}%`, minHeight: day.total > 0 ? '4px' : '0' }}
                title={`${day.label}: Rs ${day.total.toFixed(0)}`}
              />
            </div>
            <span className="text-[10px] font-medium text-slate-500">{day.shortLabel}</span>
          </div>
        )
      })}
    </div>
  )
}

export default SalesChart7
