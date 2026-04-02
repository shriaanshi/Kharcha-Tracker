import React, { useState, useEffect, useRef } from "react";

const CATEGORIES = [
  { name: "Food", icon: "🍜", color: "#FF6B6B" },
  { name: "Transport", icon: "🚗", color: "#4ECDC4" },
  { name: "Shopping", icon: "🛍️", color: "#FFE66D" },
  { name: "Health", icon: "💊", color: "#A8E6CF" },
  { name: "Bills", icon: "📄", color: "#FF8B94" },
  { name: "Entertainment", icon: "🎬", color: "#B39DDB" },
  { name: "Education", icon: "📚", color: "#81D4FA" },
  { name: "Other", icon: "💰", color: "#FFCC80" },
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    const duration = 600;
    const step = (end - start) / (duration / 16);
    clearInterval(ref.current);
    ref.current = setInterval(() => {
      start += step;
      if ((step > 0 && start >= end) || (step < 0 && start <= end)) {
        setDisplay(end);
        clearInterval(ref.current);
      } else {
        setDisplay(Math.round(start));
      }
    }, 16);
    return () => clearInterval(ref.current);
  }, [value]);
  return <span>{formatINR(display)}</span>;
}

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState([
    { id: 1, title: "Swiggy Order", amount: 450, category: "Food", date: "2025-03-28", type: "expense" },
    { id: 2, title: "Metro Card", amount: 200, category: "Transport", date: "2025-03-27", type: "expense" },
    { id: 3, title: "Salary", amount: 55000, category: "Other", date: "2025-03-01", type: "income" },
    { id: 4, title: "Netflix", amount: 649, category: "Entertainment", date: "2025-03-15", type: "expense" },
    { id: 5, title: "Gym Fee", amount: 1200, category: "Health", date: "2025-03-05", type: "expense" },
  ]);

  const [form, setForm] = useState({ title: "", amount: "", category: "Food", date: new Date().toISOString().split("T")[0], type: "expense" });
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [formError, setFormError] = useState("");
  const [animIn, setAnimIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimIn(true), 100);
  }, []);

  const totalIncome = expenses.filter(e => e.type === "income").reduce((a, b) => a + b.amount, 0);
  const totalExpense = expenses.filter(e => e.type === "expense").reduce((a, b) => a + b.amount, 0);
  const balance = totalIncome - totalExpense;

  const filteredExpenses = expenses.filter(e => {
    if (filter === "all") return true;
    return e.type === filter;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const categoryTotals = CATEGORIES.map(cat => ({
    ...cat,
    total: expenses.filter(e => e.category === cat.name && e.type === "expense").reduce((a, b) => a + b.amount, 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const m = d.getMonth();
    const y = d.getFullYear();
    return {
      label: MONTHS[m],
      income: expenses.filter(e => e.type === "income" && new Date(e.date).getMonth() === m && new Date(e.date).getFullYear() === y).reduce((a, b) => a + b.amount, 0),
      expense: expenses.filter(e => e.type === "expense" && new Date(e.date).getMonth() === m && new Date(e.date).getFullYear() === y).reduce((a, b) => a + b.amount, 0),
    };
  });

  const maxBar = Math.max(...monthlyData.map(m => Math.max(m.income, m.expense)), 1);

  function handleAdd() {
    if (!form.title.trim()) return setFormError("Title required");
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) return setFormError("Valid amount required");
    setExpenses(prev => [{ ...form, id: Date.now(), amount: Number(form.amount) }, ...prev]);
    setForm({ title: "", amount: "", category: "Food", date: new Date().toISOString().split("T")[0], type: "expense" });
    setShowForm(false);
    setFormError("");
  }

  function handleDelete(id) {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }

  const getCatInfo = (name) => CATEGORIES.find(c => c.name === name) || CATEGORIES[7];

  return (
    <div style={{ fontFamily: "'Sora', sans-serif", minHeight: "100vh", background: "#0A0A0F", color: "#F0EEF8" }}>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        .card { background: #13131A; border: 1px solid #1E1E2E; border-radius: 20px; }
        .glass { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; backdrop-filter: blur(10px); }
        .btn-primary { background: linear-gradient(135deg, #7C3AED, #A855F7); border: none; color: white; padding: 12px 24px; border-radius: 12px; cursor: pointer; font-family: 'Sora', sans-serif; font-weight: 600; font-size: 14px; transition: all 0.2s; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(124,58,237,0.4); }
        .nav-btn { background: none; border: none; color: #666; cursor: pointer; font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 500; padding: 10px 20px; border-radius: 10px; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
        .nav-btn.active { background: rgba(124,58,237,0.15); color: #A855F7; }
        .nav-btn:hover { color: #A855F7; }
        .input { background: #1A1A24; border: 1px solid #2A2A3E; color: #F0EEF8; padding: 12px 16px; border-radius: 12px; font-family: 'Sora', sans-serif; font-size: 14px; width: 100%; outline: none; transition: border 0.2s; }
        .input:focus { border-color: #7C3AED; }
        .input option { background: #1A1A24; }
        .tag { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
        .fade-in { opacity: 0; transform: translateY(20px); animation: fadeUp 0.5s forwards; }
        @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
        .shimmer { background: linear-gradient(90deg, #13131A 25%, #1a1a2e 50%, #13131A 75%); background-size: 200% 100%; }
        .expense-row { transition: all 0.2s; border-radius: 14px; }
        .expense-row:hover { background: rgba(255,255,255,0.03); }
        .delete-btn { background: none; border: none; color: #555; cursor: pointer; padding: 6px; border-radius: 8px; transition: all 0.2s; font-size: 16px; }
        .delete-btn:hover { color: #FF6B6B; background: rgba(255,107,107,0.1); }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); z-index: 100; display: flex; align-items: center; justify-content: center; }
        .filter-chip { background: none; border: 1px solid #2A2A3E; color: #666; padding: 6px 16px; border-radius: 20px; cursor: pointer; font-family: 'Sora', sans-serif; font-size: 12px; font-weight: 500; transition: all 0.2s; }
        .filter-chip.active { border-color: #7C3AED; color: #A855F7; background: rgba(124,58,237,0.1); }
      `}</style>

      {/* Header */}
      <div style={{ padding: "24px 32px 0", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1100, margin: "0 auto" }}>
        <div>
          <div style={{ fontSize: 11, color: "#555", fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>Personal Finance</div>
          <div style={{ fontSize: 26, fontWeight: 800, background: "linear-gradient(135deg, #F0EEF8, #A855F7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Kharcha Tracker
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>+</span> Add Transaction
        </button>
      </div>

      {/* Nav */}
      <div style={{ padding: "16px 32px 0", maxWidth: 1100, margin: "0 auto", display: "flex", gap: 4 }}>
        {[["dashboard","📊","Dashboard"], ["transactions","📋","Transactions"], ["analytics","📈","Analytics"]].map(([id, icon, label]) => (
          <button key={id} className={`nav-btn ${activeTab === id ? "active" : ""}`} onClick={() => setActiveTab(id)}>
            {icon} {label}
          </button>
        ))}
      </div>

      <div style={{ padding: "24px 32px 48px", maxWidth: 1100, margin: "0 auto" }}>

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div>
            {/* Balance Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
              {[
                { label: "Total Balance", value: balance, color: balance >= 0 ? "#4ECDC4" : "#FF6B6B", icon: "💎", bg: "linear-gradient(135deg, rgba(78,205,196,0.1), rgba(78,205,196,0.03))" },
                { label: "Total Income", value: totalIncome, color: "#4ECDC4", icon: "📈", bg: "linear-gradient(135deg, rgba(78,205,196,0.08), transparent)" },
                { label: "Total Expenses", value: totalExpense, color: "#FF6B6B", icon: "📉", bg: "linear-gradient(135deg, rgba(255,107,107,0.08), transparent)" },
              ].map((card, i) => (
                <div key={i} className="card fade-in" style={{ padding: 24, background: card.bg, animationDelay: `${i * 0.1}s` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#555", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>{card.label}</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: card.color }}><AnimatedNumber value={card.value} /></div>
                    </div>
                    <div style={{ fontSize: 28, opacity: 0.6 }}>{card.icon}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16 }}>
              {/* Recent Transactions */}
              <div className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 20 }}>Recent Transactions</div>
                {expenses.slice(0, 5).map((e, i) => {
                  const cat = getCatInfo(e.category);
                  return (
                    <div key={e.id} className="expense-row fade-in" style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 8px", animationDelay: `${i * 0.08}s` }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: `${cat.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{cat.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{e.title}</div>
                        <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{e.category} · {new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: e.type === "income" ? "#4ECDC4" : "#FF6B6B" }}>
                        {e.type === "income" ? "+" : "-"}{formatINR(e.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Category Breakdown */}
              <div className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 20 }}>Category Breakdown</div>
                {categoryTotals.length === 0 ? (
                  <div style={{ color: "#444", textAlign: "center", marginTop: 40, fontSize: 13 }}>No expenses yet</div>
                ) : categoryTotals.map((cat, i) => {
                  const pct = totalExpense > 0 ? (cat.total / totalExpense) * 100 : 0;
                  return (
                    <div key={cat.name} className="fade-in" style={{ marginBottom: 14, animationDelay: `${i * 0.08}s` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                        <span>{cat.icon} {cat.name}</span>
                        <span style={{ fontWeight: 600, color: cat.color }}>{formatINR(cat.total)}</span>
                      </div>
                      <div style={{ height: 6, background: "#1E1E2E", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: cat.color, borderRadius: 4, transition: "width 0.8s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {activeTab === "transactions" && (
          <div className="card fade-in" style={{ padding: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1.5 }}>All Transactions</div>
              <div style={{ display: "flex", gap: 8 }}>
                {["all", "income", "expense"].map(f => (
                  <button key={f} className={`filter-chip ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {filteredExpenses.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#444" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                <div>No transactions found</div>
              </div>
            ) : filteredExpenses.map((e, i) => {
              const cat = getCatInfo(e.category);
              return (
                <div key={e.id} className="expense-row fade-in" style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 10px", borderBottom: "1px solid #1A1A24", animationDelay: `${i * 0.05}s` }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: `${cat.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{cat.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{e.title}</div>
                    <div style={{ fontSize: 11, color: "#555", marginTop: 3, display: "flex", gap: 8 }}>
                      <span style={{ color: cat.color }}>{cat.name}</span>
                      <span>·</span>
                      <span>{new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                  <span className="tag" style={{ background: e.type === "income" ? "rgba(78,205,196,0.1)" : "rgba(255,107,107,0.1)", color: e.type === "income" ? "#4ECDC4" : "#FF6B6B" }}>
                    {e.type}
                  </span>
                  <div style={{ fontWeight: 700, fontSize: 16, color: e.type === "income" ? "#4ECDC4" : "#FF6B6B", minWidth: 100, textAlign: "right" }}>
                    {e.type === "income" ? "+" : "-"}{formatINR(e.amount)}
                  </div>
                  <button className="delete-btn" onClick={() => handleDelete(e.id)}>🗑</button>
                </div>
              );
            })}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div>
            {/* Monthly Bar Chart */}
            <div className="card fade-in" style={{ padding: 28, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 24 }}>6-Month Overview</div>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end", height: 160 }}>
                {monthlyData.map((m, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 130 }}>
                      <div style={{ width: 14, height: `${(m.income / maxBar) * 130}px`, background: "linear-gradient(to top, #4ECDC4, #4ECDC440)", borderRadius: "4px 4px 0 0", transition: "height 1s ease", minHeight: m.income > 0 ? 4 : 0 }} />
                      <div style={{ width: 14, height: `${(m.expense / maxBar) * 130}px`, background: "linear-gradient(to top, #FF6B6B, #FF6B6B40)", borderRadius: "4px 4px 0 0", transition: "height 1s ease", minHeight: m.expense > 0 ? 4 : 0 }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#555", fontWeight: 600 }}>{m.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 20, marginTop: 16, justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#888" }}>
                  <div style={{ width: 12, height: 12, background: "#4ECDC4", borderRadius: 3 }} /> Income
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#888" }}>
                  <div style={{ width: 12, height: 12, background: "#FF6B6B", borderRadius: 3 }} /> Expense
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {[
                { label: "Avg. Monthly Expense", value: totalExpense / 6, icon: "📊", color: "#FF6B6B" },
                { label: "Savings Rate", value: totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) + "%" : "0%", icon: "💰", color: "#FFE66D", isPercent: true },
                { label: "Total Transactions", value: expenses.length, icon: "📋", color: "#B39DDB", isCount: true },
              ].map((s, i) => (
                <div key={i} className="card fade-in" style={{ padding: 24, animationDelay: `${i * 0.1}s` }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{s.icon}</div>
                  <div style={{ fontSize: 11, color: "#555", fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>
                    {s.isPercent ? s.value : s.isCount ? s.value : <AnimatedNumber value={s.value} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="card fade-in" style={{ width: "100%", maxWidth: 460, padding: 32, margin: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>Add Transaction</div>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 20 }}>✕</button>
            </div>

            {/* Type Toggle */}
            <div style={{ display: "flex", background: "#0A0A0F", borderRadius: 12, padding: 4, marginBottom: 20 }}>
              {["expense", "income"].map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} style={{
                  flex: 1, padding: "10px", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: 13, transition: "all 0.2s",
                  background: form.type === t ? (t === "income" ? "rgba(78,205,196,0.15)" : "rgba(255,107,107,0.15)") : "none",
                  color: form.type === t ? (t === "income" ? "#4ECDC4" : "#FF6B6B") : "#555"
                }}>
                  {t === "income" ? "📈 Income" : "📉 Expense"}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input className="input" placeholder="Title (e.g. Zomato Order)" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <input className="input" type="number" placeholder="Amount (₹)" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
              </select>
              <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              {formError && <div style={{ color: "#FF6B6B", fontSize: 12, fontWeight: 600 }}>{formError}</div>}
              <button className="btn-primary" onClick={handleAdd} style={{ width: "100%", padding: "14px" }}>
                Add Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}