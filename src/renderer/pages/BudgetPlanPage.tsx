import { useEffect, useMemo, useState } from "react"
import type { BudgetPlan, Category, Fund } from "../../shared/ipc/api"
import { monthStringToName, toMonthKey, toMonthNumber, toYearKey } from "../../shared/utils/dates"

type SliceMode = "FIXED" | "PERCENT" | "MANUAL"
type Base = "CAP" | "NET_CAP"
type DistType = "REMAINDER" | "SURPLUS"

function isValidMonthKey(mk: string) {
  return /^\d{4}-\d{2}$/.test(mk)
}

function monthKeyToday(): string {
  return toMonthKey(new Date().toISOString())
}

function parseNumberOrThrow(label: string, s: string): number {
  const x = Number(s)
  if (!Number.isFinite(x)) throw new Error(`${label} must be a valid number`)
  return x
}

function pctLabel(p: number): string {
  return `${(p * 100).toFixed(2)}%`
}

export default function BudgetPlanPage() {
  const [err, setErr] = useState<string | null>(null)

  // reference data
  const [cats, setCats] = useState<Category[]>([])
  const [funds, setFunds] = useState<Fund[]>([])

  // plan state
  const [monthKey, setMonthKey] = useState(monthKeyToday())
  const [loadedPlan, setLoadedPlan] = useState<BudgetPlan | null>(null)

  // header fields (strings for inputs)
  const [income, setIncome] = useState("0")
  const [cap, setCap] = useState("0")

  // slice form
  const [sliceCategoryId, setSliceCategoryId] = useState("")
  const [sliceMode, setSliceMode] = useState<SliceMode>("FIXED")
  const [sliceFixed, setSliceFixed] = useState("0")
  const [slicePercent, setSlicePercent] = useState("0.10")
  const [sliceBase, setSliceBase] = useState<Base>("CAP")
  const [sliceManual, setSliceManual] = useState("0")

  // distributions form
  const [distType, setDistType] = useState<DistType>("REMAINDER")
  const [distFundId, setDistFundId] = useState("")
  const [distPct, setDistPct] = useState("0.10")

  // working arrays
  const [expenseSlices, setExpenseSlices] = useState<BudgetPlan["expenseSlices"]>([])
  const [remainderDistribution, setRemainderDistribution] = useState<BudgetPlan["remainderDistribution"]>([])
  const [surplusDistribution, setSurplusDistribution] = useState<BudgetPlan["surplusDistribution"]>([])

  const currency: BudgetPlan["currency"] = "USD"

  const monthTitle = useMemo(() => {
    if (!isValidMonthKey(monthKey)) return monthKey
    const yyyy = toYearKey(monthKey)
    const mm = toMonthNumber(monthKey)
    return `${monthStringToName(mm)} ${yyyy}`
  }, [monthKey])

  const catName = useMemo(() => {
    const m = new Map(cats.map(c => [c.id, c.name]))
    return (id: string) => m.get(id) ?? id
  }, [cats])

  const fundName = useMemo(() => {
    const m = new Map(funds.map(f => [f.id, `${f.name} (${f.key})`]))
    return (id: string) => m.get(id) ?? id
  }, [funds])

  const remainderSum = useMemo(
    () => remainderDistribution.reduce((a, r) => a + r.percentage, 0),
    [remainderDistribution]
  )
  const surplusSum = useMemo(
    () => surplusDistribution.reduce((a, r) => a + r.percentage, 0),
    [surplusDistribution]
  )

  async function refreshRefs() {
    const [c, f] = await Promise.all([window.api.listCategories(), window.api.listFunds()])
    const catsArr = Array.isArray(c) ? c : []
    const fundsArr = Array.isArray(f) ? f : []

    setCats(catsArr)
    setFunds(fundsArr)

    // safe defaults
    setSliceCategoryId(prev => prev || (catsArr[0]?.id ?? ""))
    setDistFundId(prev => prev || (fundsArr[0]?.id ?? ""))
  }

  function hydrateFromPlan(p: BudgetPlan) {
    setLoadedPlan(p)
    setIncome(String(p.income))
    setCap(String(p.cap))
    setExpenseSlices(p.expenseSlices)
    setRemainderDistribution(p.remainderDistribution)
    setSurplusDistribution(p.surplusDistribution)
  }

  function resetEmpty() {
    setLoadedPlan(null)
    setIncome("0")
    setCap("0")
    setExpenseSlices([])
    setRemainderDistribution([])
    setSurplusDistribution([])
  }

  async function load() {
    try {
      setErr(null)
      if (!isValidMonthKey(monthKey)) throw new Error('monthKey must be "YYYY-MM"')
      const p = await window.api.getBudgetPlan(monthKey)
      if (p) hydrateFromPlan(p)
      else resetEmpty()
    } catch (e: any) {
      setErr(e?.message ?? String(e))
    }
  }

  useEffect(() => {
    refreshRefs().catch(e => setErr(String(e)))
  }, [])

  // Only auto-load when the monthKey is valid (prevents spam loading while typing)
  useEffect(() => {
    if (!isValidMonthKey(monthKey)) return
    load().catch(e => setErr(String(e)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey])

  function buildPlanForSave(): BudgetPlan {
    const id = loadedPlan?.id ?? ""
    const incomeNum = parseNumberOrThrow("Income", income)
    const capNum = parseNumberOrThrow("Cap", cap)
    if (incomeNum < 0) throw new Error("Income must be >= 0")
    if (capNum < 0) throw new Error("Cap must be >= 0")

    return {
      id,
      monthKey,
      currency,
      income: incomeNum,
      cap: capNum,
      expenseSlices,
      remainderDistribution,
      surplusDistribution,
    }
  }

  async function save() {
    try {
      setErr(null)
      const plan = buildPlanForSave()
      const saved = await window.api.saveBudgetPlan(plan)
      hydrateFromPlan(saved)
    } catch (e: any) {
      setErr(e?.message ?? String(e))
    }
  }

  async function create() {
    try {
      setErr(null)
      const plan = buildPlanForSave()
      const { id: _ignore, ...input } = plan
      const created = await window.api.createBudgetPlan(input)
      hydrateFromPlan(created)
    } catch (e: any) {
      setErr(e?.message ?? String(e))
    }
  }

  async function delPlan() {
    try {
      setErr(null)
      if (!isValidMonthKey(monthKey)) throw new Error('monthKey must be "YYYY-MM"')
      await window.api.deleteBudgetPlan(monthKey) // matches your current IPC
      resetEmpty()
    } catch (e: any) {
      setErr(e?.message ?? String(e))
    }
  }

  function addSlice() {
    try {
      setErr(null)
      if (!sliceCategoryId) throw new Error("Pick a category")

      if (sliceMode === "FIXED") {
        const fixed = parseNumberOrThrow("Fixed", sliceFixed)
        if (fixed < 0) throw new Error("Fixed must be >= 0")
        setExpenseSlices(prev => [...prev, { id: "", categoryId: sliceCategoryId, mode: "FIXED", fixed }])
        return
      }

      if (sliceMode === "PERCENT") {
        const percent = parseNumberOrThrow("Percent", slicePercent)
        if (percent < 0 || percent > 1) throw new Error("Percent must be 0..1")
        setExpenseSlices(prev => [
          ...prev,
          { id: "", categoryId: sliceCategoryId, mode: "PERCENT", percent, base: sliceBase },
        ])
        return
      }

      // MANUAL
      const amount = parseNumberOrThrow("Amount", sliceManual)
      if (amount < 0) throw new Error("Manual amount must be >= 0")
      setExpenseSlices(prev => [...prev, { id: "", categoryId: sliceCategoryId, mode: "MANUAL", amount }])
    } catch (e: any) {
      setErr(e?.message ?? String(e))
    }
  }

  function removeSlice(idx: number) {
    setExpenseSlices(prev => prev.filter((_, i) => i !== idx))
  }

  function addDist() {
    try {
      setErr(null)
      if (!distFundId) throw new Error("Pick a fund")

      const percentage = parseNumberOrThrow("Percent", distPct)
      if (percentage < 0 || percentage > 1) throw new Error("Percent must be 0..1")

      const rule = { id: "", fundId: distFundId, percentage }

      if (distType === "REMAINDER") setRemainderDistribution(prev => [...prev, rule])
      else setSurplusDistribution(prev => [...prev, rule])
    } catch (e: any) {
      setErr(e?.message ?? String(e))
    }
  }

  function removeDist(type: DistType, idx: number) {
    if (type === "REMAINDER") setRemainderDistribution(prev => prev.filter((_, i) => i !== idx))
    else setSurplusDistribution(prev => prev.filter((_, i) => i !== idx))
  }

  return (
    <div style={{ padding: 16, maxWidth: 1000 }}>
      <h2>Budget Plan — {monthTitle}</h2>

      {/* Month selector + actions */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
        <label style={{ fontSize: 12, opacity: 0.8 }}>Month</label>
        <input
          value={monthKey}
          onChange={e => setMonthKey(e.target.value)}
          placeholder="YYYY-MM"
          style={{ padding: 8, width: 120 }}
        />

        <button onClick={load} style={{ padding: "8px 12px" }}>Load</button>
        <button onClick={save} style={{ padding: "8px 12px" }}>Save</button>
        <button onClick={create} style={{ padding: "8px 12px" }}>Create</button>
        <button onClick={delPlan} style={{ padding: "8px 12px" }}>Delete</button>

        <span style={{ fontSize: 12, opacity: 0.7 }}>
          {loadedPlan ? `Loaded id: ${loadedPlan.id}` : "No plan loaded for this month"}
        </span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <input
          value={income}
          onChange={e => setIncome(e.target.value)}
          placeholder="Income"
          inputMode="decimal"
          style={{ padding: 8, width: 160 }}
        />
        <input
          value={cap}
          onChange={e => setCap(e.target.value)}
          placeholder="Cap"
          inputMode="decimal"
          style={{ padding: 8, width: 160 }}
        />
      </div>

      {err && <div style={{ color: "crimson", marginBottom: 12 }}>{err}</div>}

      {/* Expense slices */}
      <div style={{ borderTop: "1px solid #eee", paddingTop: 12, marginTop: 12 }}>
        <h3 style={{ margin: "8px 0" }}>Expense Slices</h3>

        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          <select
            value={sliceCategoryId}
            onChange={e => setSliceCategoryId(e.target.value)}
            style={{ padding: 8, minWidth: 260 }}
          >
            {cats.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select value={sliceMode} onChange={e => setSliceMode(e.target.value as SliceMode)} style={{ padding: 8 }}>
            <option value="FIXED">FIXED</option>
            <option value="PERCENT">PERCENT</option>
            <option value="MANUAL">MANUAL</option>
          </select>

          {sliceMode === "FIXED" && (
            <input
              value={sliceFixed}
              onChange={e => setSliceFixed(e.target.value)}
              placeholder="Fixed amount"
              inputMode="decimal"
              style={{ padding: 8, width: 160 }}
            />
          )}

          {sliceMode === "PERCENT" && (
            <>
              <input
                value={slicePercent}
                onChange={e => setSlicePercent(e.target.value)}
                placeholder="Percent (0..1)"
                inputMode="decimal"
                style={{ padding: 8, width: 160 }}
              />
              <select value={sliceBase} onChange={e => setSliceBase(e.target.value as Base)} style={{ padding: 8 }}>
                <option value="CAP">CAP</option>
                <option value="NET_CAP">NET_CAP</option>
              </select>
            </>
          )}

          {sliceMode === "MANUAL" && (
            <input
              value={sliceManual}
              onChange={e => setSliceManual(e.target.value)}
              placeholder="Manual amount"
              inputMode="decimal"
              style={{ padding: 8, width: 160 }}
            />
          )}

          <button onClick={addSlice} style={{ padding: "8px 12px" }}>
            Add Slice
          </button>
        </div>

        <ul style={{ paddingLeft: 18 }}>
          {expenseSlices.map((s, idx) => (
            <li
              key={`${s.categoryId}-${idx}`}
              style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}
            >
              <span>
                <b>{catName(s.categoryId)}</b>{" "}
                — {s.mode}{" "}
                {s.mode === "FIXED" && `($${s.fixed.toFixed(2)})`}
                {s.mode === "PERCENT" && `(${pctLabel(s.percent)} of ${s.base})`}
                {s.mode === "MANUAL" && `($${s.amount.toFixed(2)})`}
              </span>
              <button onClick={() => removeSlice(idx)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Distributions */}
      <div style={{ borderTop: "1px solid #eee", paddingTop: 12, marginTop: 12 }}>
        <h3 style={{ margin: "8px 0" }}>Distributions</h3>

        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          <select value={distType} onChange={e => setDistType(e.target.value as DistType)} style={{ padding: 8 }}>
            <option value="REMAINDER">REMAINDER</option>
            <option value="SURPLUS">SURPLUS</option>
          </select>

          <select value={distFundId} onChange={e => setDistFundId(e.target.value)} style={{ padding: 8, minWidth: 260 }}>
            {funds.map(f => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.key})
              </option>
            ))}
          </select>

          <input
            value={distPct}
            onChange={e => setDistPct(e.target.value)}
            placeholder="Percent (0..1)"
            inputMode="decimal"
            style={{ padding: 8, width: 160 }}
          />

          <button onClick={addDist} style={{ padding: "8px 12px" }}>
            Add Rule
          </button>
        </div>

        <h4 style={{ margin: "8px 0" }}>
          Remainder <span style={{ fontSize: 12, opacity: 0.7 }}>(sum: {pctLabel(remainderSum)})</span>
        </h4>
        <ul style={{ paddingLeft: 18 }}>
          {remainderDistribution.map((r, idx) => (
            <li
              key={`${r.fundId}-${idx}`}
              style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}
            >
              <span>{fundName(r.fundId)} — {pctLabel(r.percentage)}</span>
              <button onClick={() => removeDist("REMAINDER", idx)}>Delete</button>
            </li>
          ))}
        </ul>

        <h4 style={{ margin: "8px 0" }}>
          Surplus <span style={{ fontSize: 12, opacity: 0.7 }}>(sum: {pctLabel(surplusSum)})</span>
        </h4>
        <ul style={{ paddingLeft: 18 }}>
          {surplusDistribution.map((r, idx) => (
            <li
              key={`${r.fundId}-${idx}`}
              style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}
            >
              <span>{fundName(r.fundId)} — {pctLabel(r.percentage)}</span>
              <button onClick={() => removeDist("SURPLUS", idx)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
