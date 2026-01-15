import { useEffect, useMemo, useState } from "react"
import type { Fund, FundEntry } from "../../shared/ipc/api"

export default function FundEntriesPage() {
  const [funds, setFunds] = useState<Fund[]>([])
  const [entries, setEntries] = useState<FundEntry[]>([])
  const [err, setErr] = useState<string | null>(null)

  // form state
  const [fundId, setFundId] = useState("")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10)) // YYYY-MM-DD
  const [amount, setAmount] = useState("0")
  const [kind, setKind] = useState<FundEntry["kind"]>("EXPENSE")
  const [categoryId, setCategoryId] = useState("")
  const [memo, setMemo] = useState("")

  const selectedFund = useMemo(
    () => funds.find(f => f.id === fundId) ?? null,
    [funds, fundId]
  )

  async function refreshFunds() {
    const data = await window.api.listFunds()
    setFunds(Array.isArray(data) ? data : [])
    if (!fundId && Array.isArray(data) && data.length) setFundId(data[0].id)
  }

  async function refreshEntries(targetFundId?: string) {
    const data = await window.api.listFundEntries(targetFundId ?? fundId)
    setEntries(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    setErr(null)
    refreshFunds()
      .then(() => refreshEntries())
      .catch(e => setErr(String(e)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!fundId) return
    refreshEntries(fundId).catch(e => setErr(String(e)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fundId])

  async function add() {
    try {
      setErr(null)

      if (!fundId) throw new Error("Pick a fund first")
      if (!date) throw new Error("Date is required")
      if (!categoryId.trim()) throw new Error("Category ID is required (temporary)")

      const amt = Number(amount)
      if (!Number.isFinite(amt)) throw new Error("Amount must be a number")
      if (amt === 0) throw new Error("Amount cannot be 0")

      // Convention: EXPENSE should be negative, INCOME positive
      const signedAmount =
        kind === "EXPENSE" ? -Math.abs(amt) : Math.abs(amt)

      await window.api.createFundEntry({
        fundId,
        date, // keep as YYYY-MM-DD; your repo converts to month_key
        amount: signedAmount,
        kind,
        categoryId: categoryId.trim(),
        memo: memo.trim() || undefined,
      })

      setAmount("0")
      setCategoryId("")
      setMemo("")
      await refreshEntries(fundId)
      await refreshFunds() // if your fund balance is recomputed/cached elsewhere
    } catch (e: any) {
      setErr(e?.message ?? String(e))
    }
  }

  async function del(entryId: string) {
    try {
      setErr(null)
      await window.api.deleteFundEntry(entryId)
      await refreshEntries(fundId)
      await refreshFunds()
    } catch (e: any) {
      setErr(e?.message ?? String(e))
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 900 }}>
      <h2>Fund Entries</h2>

      {/* selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
        <label style={{ fontSize: 12, opacity: 0.8 }}>Fund</label>
        <select
          value={fundId}
          onChange={e => setFundId(e.target.value)}
          style={{ padding: 8, minWidth: 260 }}
        >
          {funds.map(f => (
            <option key={f.id} value={f.id}>
              {f.name} ({f.key})
            </option>
          ))}
        </select>

        {selectedFund && (
          <span style={{ fontSize: 12, opacity: 0.8 }}>
            Balance: {Number(selectedFund.balance).toFixed(2)} {selectedFund.currency}
          </span>
        )}
      </div>

      {/* form */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{ padding: 8 }}
        />

        <select
          value={kind}
          onChange={e => setKind(e.target.value as FundEntry["kind"])}
          style={{ padding: 8 }}
        >
          <option value="EXPENSE">EXPENSE</option>
          <option value="INCOME">INCOME</option>
        </select>

        <input
          value={amount}
          onChange={e => setAmount(e.target.value)}
          inputMode="decimal"
          placeholder="Amount"
          style={{ padding: 8, width: 140 }}
        />

        {/* temporary until you have category picker */}
        <input
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          placeholder='Category ID (temporary)'
          style={{ padding: 8, width: 220 }}
        />

        <input
          value={memo}
          onChange={e => setMemo(e.target.value)}
          placeholder="Memo (optional)"
          style={{ padding: 8, flex: 1, minWidth: 220 }}
        />

        <button onClick={add} style={{ padding: "8px 12px" }}>
          Add
        </button>
      </div>

      {err && <div style={{ color: "crimson", marginBottom: 12 }}>{err}</div>}

      {/* list */}
      <ul style={{ paddingLeft: 18 }}>
        {entries.map(e => (
          <li
            key={e.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: 600 }}>
                {e.date} — {e.kind} — {Number(e.amount).toFixed(2)}
              </span>
              <span style={{ fontSize: 12, opacity: 0.8 }}>
                category: {e.categoryId}
                {e.memo ? ` • ${e.memo}` : ""}
              </span>
            </div>

            <button onClick={() => del(e.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
