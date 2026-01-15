import { useEffect, useState } from "react"
import type { Category } from "../../shared/ipc/api"

export default function CategoriesTest() {
  const [cats, setCats] = useState<Category[]>([])
  const [name, setName] = useState("")
  const [err, setErr] = useState<string | null>(null)

  async function refresh() {
    setErr(null)
    const data = await window.api.listCategories()
    setCats(data)
  }

  useEffect(() => { refresh().catch(e => setErr(String(e))) }, [])

  async function add() {
    try {
      await window.api.createCategory(name)
      setName("")
      await refresh()
    } catch (e: any) {
      setErr(e?.message ?? String(e))
    }
  }

  async function del(id: string) {
    try {
      await window.api.deleteCategory(id)
      await refresh()
    } catch (e: any) {
      setErr(e?.message ?? String(e))
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 600 }}>
      <h2>Categories</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder='e.g. "Caffeine"'
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={add} style={{ padding: "8px 12px" }}>Add</button>
      </div>

      {err && <div style={{ color: "crimson", marginBottom: 12 }}>{err}</div>}

      <ul>
        {cats.map(c => (
          <li key={c.id} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <span>{c.name}</span>
            <button onClick={() => del(c.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
