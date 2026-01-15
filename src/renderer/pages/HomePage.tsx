type Props = {
  go: (page: "home" | "categories" | "funds" | "entries" | "budgets" | "transfers") => void
}

export default function HomePage({ go }: Props) {
  return (
    <div style={{ padding: 16 }}>
      <h2>Budget App</h2>
      <p>Select a page:</p>

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => go("categories")} style={{ padding: "10px 14px" }}>
          Categories
        </button>
        <button onClick={() => go("funds")} style={{ padding: "10px 14px" }}>
          Funds
        </button>
        <button onClick={() => go("entries")} style={{ padding: "10px 14px" }}>
          Fund Entries
        </button>
        <button onClick={() => go("budgets")} style={{ padding: "10px 14px" }}>
          Budgets
        </button>
        <button onClick={() => go("transfers")} style={{ padding: "10px 14px" }}>
          Transfers
        </button>
      </div>
    </div>
  )
}
