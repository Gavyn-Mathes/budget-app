import { useEffect, useState } from "react"
import type { Fund, CreateFundInput } from "../../shared/ipc/api"

export default function FundsPage() {
  const [funds, setFunds] = useState<Fund[]>([])
  const [key, setKey] = useState("")
  const [name, setName] = useState("")
  const [err, setErr] = useState<string | null>(null)

  async function refresh() {
    setErr(null)
    const data = await window.api.listFunds()
    setFunds(Array.isArray(data) ? data : [])
    if (!Array.isArray(data)) console.error("listFunds returned:", data)
  }

  useEffect(() => {
    refresh().catch(e => setErr(String(e)))
  }, [])

  async function add() {
    try {
      setErr(null)

      const k = key.trim().toUpperCase()
      const n = name.trim()

      if (!k) throw new Error('Fund key is required (e.g. "EFUND")')
      if (!n) throw new Error("Fund name is required")

      const input: CreateFundInput = { key: k, name: n, currency: "USD" }
      await window.api.createFund(input)

      setKey("")
      setName("")
      await refresh()
    } catch (e: any) {
      setErr(e?.message ?? String(e))
    }
  }

  async function del(id: string) {
    try {
      setErr(null)
      await window.api.deleteFund(id)
      await refresh()
    } catch (e: any) {
      setErr(e?.message ?? String(e))
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 700 }}>
      <h2>Funds</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder='Key (e.g. "EFUND")'
          style={{ width: 160, padding: 8 }}
        />
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder='Name (e.g. "Emergency Fund")'
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={add} style={{ padding: "8px 12px" }}>
          Add
        </button>
      </div>

      {err && <div style={{ color: "crimson", marginBottom: 12 }}>{err}</div>}

      <ul style={{ paddingLeft: 18 }}>
        {funds.map(f => (
          <li
            key={f.id}
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
                {f.name} <span style={{ opacity: 0.7, fontWeight: 400 }}>({f.key})</span>
              </span>
              <span style={{ fontSize: 12, opacity: 0.8 }}>
                Balance: {Number(f.balance).toFixed(2)} {f.currency}
              </span>
            </div>

            <button onClick={() => del(f.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
