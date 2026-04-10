import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Plus, Trash2, Pencil, Check, X, Landmark, CreditCard, TrendingUp, PiggyBank, Wallet } from "lucide-react";
import { Glass, Btn } from "../ui";

const ACCOUNT_TYPES = [
  { id: "checking", label: "Checking", icon: Wallet, color: "#5B8DEF" },
  { id: "savings", label: "Savings", icon: PiggyBank, color: "#22C55E" },
  { id: "investment", label: "Investment", icon: TrendingUp, color: "#8B5CF6" },
  { id: "credit", label: "Credit Card", icon: CreditCard, color: "#EF4444" },
  { id: "loan", label: "Loan", icon: Landmark, color: "#F97316" },
  { id: "other", label: "Other", icon: Wallet, color: "#94A3B8" },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", backdropFilter: "blur(20px)", boxShadow: "var(--card-shadow)" }}>
      <div style={{ fontFamily: "var(--heading)", fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
          <span style={{ fontFamily: "var(--body)", fontSize: 11, color: "var(--muted)" }}>{p.name}:</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: p.color }}>${p.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
        </div>
      ))}
    </div>
  );
}

export default function FinanceNetWorth({ accounts, addAccount, updateAccount, deleteAccount, netWorthHistory, inputStyle }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("checking");
  const [newBalance, setNewBalance] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editBalance, setEditBalance] = useState("");

  const assets = accounts.filter(a => !["credit", "loan"].includes(a.type));
  const liabilities = accounts.filter(a => ["credit", "loan"].includes(a.type));
  const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = liabilities.reduce((s, a) => s + a.balance, 0);
  const netWorth = totalAssets - totalLiabilities;

  const handleAdd = () => {
    if (!newName.trim() || !newBalance) return;
    const bal = parseFloat(newBalance);
    if (isNaN(bal)) return;
    addAccount({ name: newName.trim(), type: newType, balance: bal });
    setNewName(""); setNewBalance(""); setNewType("checking"); setShowAdd(false);
  };

  const handleUpdateBalance = (id) => {
    const val = parseFloat(editBalance);
    if (isNaN(val)) return;
    updateAccount(id, { balance: val });
    setEditingId(null);
  };

  const getTypeInfo = (type) => ACCOUNT_TYPES.find(t => t.id === type) || ACCOUNT_TYPES[5];

  return (
    <div>
      {/* Net Worth Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
        <Glass style={{ padding: 18, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Total Assets</div>
          <div style={{ fontFamily: "var(--heading)", fontSize: 24, fontWeight: 800, color: "#22C55E" }}>${totalAssets.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
        </Glass>
        <Glass style={{ padding: 18, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Total Liabilities</div>
          <div style={{ fontFamily: "var(--heading)", fontSize: 24, fontWeight: 800, color: "#EF4444" }}>${totalLiabilities.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
        </Glass>
        <Glass style={{ padding: 18, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Net Worth</div>
          <div style={{ fontFamily: "var(--heading)", fontSize: 24, fontWeight: 800, color: netWorth >= 0 ? "#22C55E" : "#EF4444" }}>
            {netWorth >= 0 ? "" : "-"}${Math.abs(netWorth).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
        </Glass>
      </div>

      {/* Net Worth Over Time Chart */}
      {netWorthHistory.length > 1 && (
        <Glass style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16, fontWeight: 600 }}>Net Worth Over Time</div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={netWorthHistory} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontFamily: "var(--mono)", fontSize: 10, fill: "var(--muted)" }} />
              <YAxis tick={{ fontFamily: "var(--mono)", fontSize: 10, fill: "var(--muted)" }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="netWorth" name="Net Worth" stroke="#5B8DEF" strokeWidth={2.5} dot={{ r: 4, fill: "#5B8DEF" }} />
              <Line type="monotone" dataKey="assets" name="Assets" stroke="#22C55E" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
              <Line type="monotone" dataKey="liabilities" name="Liabilities" stroke="#EF4444" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Glass>
      )}

      {/* Accounts List */}
      {assets.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, fontWeight: 600 }}>Assets</div>
          {assets.map((acc, i) => {
            const typeInfo = getTypeInfo(acc.type);
            const Icon = typeInfo.icon;
            return (
              <Glass key={acc.id} style={{ padding: 16, marginBottom: 8, display: "flex", alignItems: "center", gap: 14, animation: `slideUp 0.3s ${i * 0.04}s both ease-out` }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${typeInfo.color}14`, display: "flex", alignItems: "center", justifyContent: "center", color: typeInfo.color }}>
                  <Icon size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--heading)", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{acc.name}</div>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: typeInfo.color, background: `${typeInfo.color}14`, padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>{typeInfo.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {editingId === acc.id ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>$</span>
                      <input value={editBalance} onChange={e => setEditBalance(e.target.value)} type="number" step="0.01"
                        onKeyDown={e => e.key === "Enter" && handleUpdateBalance(acc.id)}
                        style={{ width: 100, padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border)", fontFamily: "var(--mono)", fontSize: 12, outline: "none", background: "var(--subtle-bg)", color: "var(--text)" }} autoFocus />
                      <div onClick={() => handleUpdateBalance(acc.id)} style={{ cursor: "pointer", color: "#22C55E" }}><Check size={14} /></div>
                      <div onClick={() => setEditingId(null)} style={{ cursor: "pointer", color: "var(--muted)" }}><X size={14} /></div>
                    </div>
                  ) : (
                    <>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, color: "#22C55E" }}>${acc.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                      <div role="button" onClick={() => { setEditingId(acc.id); setEditBalance(String(acc.balance)); }} style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--muted)", transition: "all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.color = "var(--primary)"; e.currentTarget.style.background = "var(--subtle-bg)"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.background = "transparent"; }}
                      ><Pencil size={14} /></div>
                      <div role="button" onClick={() => deleteAccount(acc.id)} style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--muted)", transition: "all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.background = "transparent"; }}
                      ><Trash2 size={14} /></div>
                    </>
                  )}
                </div>
              </Glass>
            );
          })}
        </div>
      )}

      {liabilities.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, fontWeight: 600 }}>Liabilities</div>
          {liabilities.map((acc, i) => {
            const typeInfo = getTypeInfo(acc.type);
            const Icon = typeInfo.icon;
            return (
              <Glass key={acc.id} style={{ padding: 16, marginBottom: 8, display: "flex", alignItems: "center", gap: 14, animation: `slideUp 0.3s ${i * 0.04}s both ease-out` }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${typeInfo.color}14`, display: "flex", alignItems: "center", justifyContent: "center", color: typeInfo.color }}>
                  <Icon size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--heading)", fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{acc.name}</div>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: typeInfo.color, background: `${typeInfo.color}14`, padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>{typeInfo.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {editingId === acc.id ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>$</span>
                      <input value={editBalance} onChange={e => setEditBalance(e.target.value)} type="number" step="0.01"
                        onKeyDown={e => e.key === "Enter" && handleUpdateBalance(acc.id)}
                        style={{ width: 100, padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border)", fontFamily: "var(--mono)", fontSize: 12, outline: "none", background: "var(--subtle-bg)", color: "var(--text)" }} autoFocus />
                      <div onClick={() => handleUpdateBalance(acc.id)} style={{ cursor: "pointer", color: "#22C55E" }}><Check size={14} /></div>
                      <div onClick={() => setEditingId(null)} style={{ cursor: "pointer", color: "var(--muted)" }}><X size={14} /></div>
                    </div>
                  ) : (
                    <>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, color: "#EF4444" }}>-${acc.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                      <div role="button" onClick={() => { setEditingId(acc.id); setEditBalance(String(acc.balance)); }} style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--muted)", transition: "all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.color = "var(--primary)"; e.currentTarget.style.background = "var(--subtle-bg)"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.background = "transparent"; }}
                      ><Pencil size={14} /></div>
                      <div role="button" onClick={() => deleteAccount(acc.id)} style={{ width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--muted)", transition: "all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.background = "transparent"; }}
                      ><Trash2 size={14} /></div>
                    </>
                  )}
                </div>
              </Glass>
            );
          })}
        </div>
      )}

      {/* Add Account */}
      {showAdd ? (
        <Glass style={{ padding: 18, marginBottom: 8 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14, fontWeight: 600 }}>Add Account</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {ACCOUNT_TYPES.map(t => (
              <div key={t.id} onClick={() => setNewType(t.id)} style={{
                padding: "6px 12px", borderRadius: 8, cursor: "pointer",
                background: newType === t.id ? `${t.color}18` : "var(--hover-bg)",
                border: newType === t.id ? `2px solid ${t.color}` : "2px solid transparent",
                fontFamily: "var(--body)", fontSize: 11, fontWeight: 600, color: newType === t.id ? t.color : "var(--muted)",
                transition: "all 0.15s",
              }}>{t.label}</div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Account name"
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              style={{ ...inputStyle, flex: 2 }} />
            <div style={{ position: "relative", flex: 1 }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontFamily: "var(--mono)", fontSize: 13, color: "var(--muted)" }}>$</span>
              <input value={newBalance} onChange={e => setNewBalance(e.target.value)} placeholder="0.00" type="number" step="0.01"
                onKeyDown={e => e.key === "Enter" && handleAdd()}
                style={{ ...inputStyle, paddingLeft: 24 }} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Btn onClick={() => setShowAdd(false)}>Cancel</Btn>
            <Btn primary onClick={handleAdd}>+ Add Account</Btn>
          </div>
        </Glass>
      ) : (
        <div onClick={() => setShowAdd(true)} style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 14, borderRadius: 12,
          border: "2px dashed var(--border)", cursor: "pointer", color: "var(--muted)",
          fontFamily: "var(--body)", fontSize: 13, fontWeight: 600, transition: "all 0.15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}
        >
          <Plus size={16} /> Add Account
        </div>
      )}

      {accounts.length === 0 && !showAdd && (
        <Glass style={{ padding: 40, textAlign: "center", marginTop: 14 }}>
          <Landmark size={32} color="var(--muted)" style={{ marginBottom: 12 }} />
          <div style={{ fontFamily: "var(--body)", fontSize: 14, color: "var(--muted)" }}>Track your accounts to monitor net worth over time</div>
        </Glass>
      )}
    </div>
  );
}
