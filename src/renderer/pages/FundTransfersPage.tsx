import { useEffect, useMemo, useState } from "react"
import type { Fund, FundTransfer } from "../../shared/ipc/api"
import { toMonthKey } from "../../shared/utils/dates"

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10)
}

function parseNumberOrThrow(label: string, s: string): number {
  const x = Number(s)
  if (!Number.isFinite(x)) throw new Error(`${label} must be a valid number`)
  return x
}

export default function TransfersPage() {
  const [funds, setFunds] = useState<Fund[]>([])
  const [transfers, setTransfers] = useState<FundTransfer[]>([])
  const [err, setErr] = useState<string | null>(null)

  // create form
  const [fromFundId, setFromFundId] = useState("")
  const [toFundId, setToFundId] = useState("")
  const [date, setDate] = useState(todayISODate())
  const [amount, setAmount] = useState("0")
  const [memo, setMemo] = useState("")

  // filters
  const [monthFilterEnabled, setMonthFilterEnabled] = useState(false)
  const [monthKey, setMonthKey] = useState(toMonthKey(todayISODate())) // "YYYY-MM"

  const [betweenFilterEnabled, setBetweenFilterEnabled] = useState(false)
  const [filterA, setFilterA] = useState("")
  const [filterB, setFilterB] = useState("")

  const fundLabel = useMemo(() => {
    const m = new Map(funds.map(f => [f.id, `${f.name} (${f.key})`]))
    return (id: string) => m.get(id) ?? id
  }, [funds])

  async function refreshFunds() {
    const data = await window.api.listFunds()
    const arr = Array.isArray(data) ? data : []
    setFunds(arr)

    // defaults for create form
    if (arr.length && !fromFundId) setFromFundId(arr[0].id)
    if (arr.length >= 2 && !toFundId) setToFundId(arr[1].id)
    if (arr.length === 1 && !toFundId) setToFundId(arr[0].id)

    // defaults for between filter
    if (arr.length && !filterA) setFilterA(arr[0].id)
    if (arr.length >= 2 && !filterB) setFilterB(arr[1].id)
    if (arr.length === 1 && !filterB) setFilterB(arr[0].id)
  }

  async function refreshTransfers() {
    // If you haven't added optional params to listFundTransfers yet,
    // just set betweenFilterEnabled=false in UI or remove that section.
    const data = betweenFilterEnabled
      ? await window.api.listFundTransfers(filterA || undefined, filterB || undefined)
      : await window.api.listFundTransfers()

    setTransfers(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    setErr(null)
    Promise.all([refreshFunds(), refreshTransfers()]).catch(e => setErr(String(e)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // if between filter changes, refetch (server-side filter)
  useEffect(() => {
    refreshTransfers().catch(e => setErr(String(e)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [betweenFilterEnabled, filterA, filterB])

  const shownTransfers = useMemo(() => {
    if (!monthFilterEnabled) return transfers
    return transfers.filter(t => toMonthKey(t.date) === monthKey)
  }, [transfers, monthFilterEnabled, monthKey])

  async function create() {
    try {
      setErr(null)

      if (!fromFundId) throw new Error("Pick a FROM fund")
      if (!toFundId) throw new Error("Pick a TO fund")
      if (fromFundId === toFundId) throw new Error("FROM and TO fund must be different")
      if (!date) throw new Error("Date is required")

      const amt = parseNumberOrThrow("Amount", amount)
      if (amt <= 0) throw new Error("Amount must be > 0")

      await window.api.createFundTransfer({
        fromFundId,
        toFundId,
        date,
        amount: Math.abs(amt),
        memo: memo.trim() || undefined,
      })

      setAmount("0")
      setMemo("")
      await refreshTransfers()
      await refreshFunds()
    } catch (e: any) {
      setErr(e?.message ?? String(e))
    }
  }

  async function del(transferId: string) {
    try {
      setErr(null)
      await window.api.deleteFundTransfer(transferId)
      await refreshTransfers()
      await refreshFunds()
    } catch (e: any) {
      setErr(e?.message ?? String(e))
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 1000 }}>
      <h2>Transfers</h2>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
        {/* month filter */}
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={monthFilterEnabled}
            onChange={e => setMonthFilterEnabled(e.target.checked)}
          />
          Filter by month
        </label>

        <input
          disabled={!monthFilterEnabled}
          value={monthKey}
          onChange={e => setMonthKey(e.target.value)}
          placeholder="YYYY-MM"
          style={{ padding: 8, width: 120, opacity: monthFilterEnabled ? 1 : 0.6 }}
        />

        {/* between two funds filter (server-side) */}
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={betweenFilterEnabled}
            onChange={e => setBetweenFilterEnabled(e.target.checked)}
          />
          Show between two funds
        </label>

        <select
          disabled={!betweenFilterEnabled}
          value={filterA}
          onChange={e => setFilterA(e.target.value)}
          style={{ padding: 8, minWidth: 220, opacity: betweenFilterEnabled ? 1 : 0.6 }}
        >
          {funds.map(f => (
            <option key={f.id} value={f.id}>
              {f.name} ({f.key})
            </option>
          ))}
        </select>

        <span style={{ opacity: betweenFilterEnabled ? 1 : 0.6 }}>↔</span>

        <select
          disabled={!betweenFilterEnabled}
          value={filterB}
          onChange={e => setFilterB(e.target.value)}
          style={{ padding: 8, minWidth: 220, opacity: betweenFilterEnabled ? 1 : 0.6 }}
        >
          {funds.map(f => (
            <option key={f.id} value={f.id}>
              {f.name} ({f.key})
            </option>
          ))}
        </select>

        {betweenFilterEnabled && (
          <button onClick={() => refreshTransfers().catch(e => setErr(String(e)))} style={{ padding: "8px 12px" }}>
            Apply
          </button>
        )}
      </div>

      {/* create transfer */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <select value={fromFundId} onChange={e => setFromFundId(e.target.value)} style={{ padding: 8, minWidth: 260 }}>
          {funds.map(f => (
            <option key={f.id} value={f.id}>
              From: {f.name} ({f.key})
            </option>
          ))}
        </select>

        <select value={toFundId} onChange={e => setToFundId(e.target.value)} style={{ padding: 8, minWidth: 260 }}>
          {funds.map(f => (
            <option key={f.id} value={f.id}>
              To: {f.name} ({f.key})
            </option>
          ))}
        </select>

        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: 8 }} />

        <input
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Amount"
          inputMode="decimal"
          style={{ padding: 8, width: 140 }}
        />

        <input
          value={memo}
          onChange={e => setMemo(e.target.value)}
          placeholder="Memo (optional)"
          style={{ padding: 8, minWidth: 240, flex: 1 }}
        />

        <button onClick={create} style={{ padding: "8px 12px" }}>
          Transfer
        </button>
      </div>

      {err && <div style={{ color: "crimson", marginBottom: 12 }}>{err}</div>}

      {/* list */}
      <ul style={{ paddingLeft: 18 }}>
        {shownTransfers.map(t => (
          <li
            key={t.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: 600 }}>
                {t.date} — {Number(t.amount).toFixed(2)}
              </span>
              <span style={{ fontSize: 12, opacity: 0.8 }}>
                {fundLabel(t.fromFundId)} → {fundLabel(t.toFundId)}
                {t.memo ? ` • ${t.memo}` : ""}
              </span>
            </div>

            <button onClick={() => del(t.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
