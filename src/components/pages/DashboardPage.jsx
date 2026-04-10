import { useState } from "react";
import {
  DollarSign, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight,
  Wallet, Receipt, CreditCard, AlertTriangle, Calendar, BarChart3,
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Glass } from "../ui";

const CHART_COLORS = ["#6366F1","#8B5CF6","#EC4899","#EF4444","#F97316","#FBBF24","#22C55E","#14B8A6","#5B8DEF","#94A3B8"];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", backdropFilter: "blur(20px)", boxShadow: "var(--card-shadow)" }}>
      <div style={{ fontFamily: "var(--heading)", fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
          <span style={{ fontFamily: "var(--body)", fontSize: 11, color: "var(--muted)" }}>{p.name}:</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: p.color }}>
            ${p.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage({
  greeting, transactions, bills, billPayments, budgets,
  accounts, netWorthHistory, getCategories, setPage,
}) {
  const cats = getCategories();
  const allCats = [...cats.income, ...cats.expense];
  const getCat = (id) => allCats.find(c => c.id === id) || { label: id, color: "#94A3B8" };

  // ─── Current month calculations ───
  const now = new Date();
  const currentMonthKey = now.toISOString().slice(0, 7);
  const monthTx = transactions.filter(t => t.date?.startsWith(currentMonthKey));
  const monthIncome = monthTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const monthTxExpenses = monthTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const monthBillsTotal = bills.reduce((s, b) => s + b.amount, 0);
  const monthExpenses = monthTxExpenses + monthBillsTotal;
  const monthNet = monthIncome - monthExpenses;
  const savingsRate = monthIncome > 0 ? (monthNet / monthIncome * 100) : 0;

  // ─── Previous month for comparison ───
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthKey = prevDate.toISOString().slice(0, 7);
  const prevTx = transactions.filter(t => t.date?.startsWith(prevMonthKey));
  const prevIncome = prevTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const prevExpenses = prevTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0) + monthBillsTotal;

  const incomeChange = prevIncome > 0 ? ((monthIncome - prevIncome) / prevIncome * 100) : 0;
  const expenseChange = prevExpenses > 0 ? ((monthExpenses - prevExpenses) / prevExpenses * 100) : 0;

  // ─── Net worth ───
  const assets = accounts.filter(a => !["credit", "loan"].includes(a.type));
  const liabilities = accounts.filter(a => ["credit", "loan"].includes(a.type));
  const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = liabilities.reduce((s, a) => s + Math.abs(a.balance), 0);
  const netWorth = totalAssets - totalLiabilities;

  // ─── Spending by category (current month) ───
  const categorySpending = cats.expense.map(cat => {
    const txSpent = monthTx.filter(t => t.type === "expense" && t.category === cat.id).reduce((s, t) => s + t.amount, 0);
    const billSpent = bills.filter(b => b.category === cat.id).reduce((s, b) => s + b.amount, 0);
    return { name: cat.label, value: txSpent + billSpent, color: cat.color, id: cat.id };
  }).filter(c => c.value > 0).sort((a, b) => b.value - a.value);

  // ─── Budget health ───
  const totalBillsByCategory = {};
  bills.forEach(b => { totalBillsByCategory[b.category] = (totalBillsByCategory[b.category] || 0) + b.amount; });
  const budgetItems = budgets.map(b => {
    const cat = getCat(b.categoryId);
    const txSpent = monthTx.filter(t => t.type === "expense" && t.category === b.categoryId).reduce((s, t) => s + t.amount, 0);
    const billSpent = totalBillsByCategory[b.categoryId] || 0;
    const spent = txSpent + billSpent;
    const pct = b.limit > 0 ? (spent / b.limit * 100) : 0;
    return { ...cat, spent, limit: b.limit, pct, categoryId: b.categoryId };
  }).filter(b => b.limit > 0);
  const overBudgetCount = budgetItems.filter(b => b.pct > 100).length;

  // ─── Upcoming bills ───
  const today = now.getDate();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const upcomingBills = bills.flatMap(bill => {
    const dueDays = bill.dueDays || [bill.dueDay || 1];
    return dueDays
      .filter(d => d >= today)
      .map(d => ({
        ...bill,
        dueDay: d,
        paid: (billPayments[`${bill.id}-${monthKey}`] || 0) > 0,
      }));
  }).sort((a, b) => a.dueDay - b.dueDay).slice(0, 5);

  // ─── Monthly trend (last 6 months) ───
  const trendData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString("en-US", { month: "short" });
    const mTx = transactions.filter(t => t.date?.startsWith(key));
    const inc = mTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const exp = mTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0) + monthBillsTotal;
    trendData.push({ month: label, income: inc, expenses: exp, net: inc - exp });
  }

  // ─── Recent transactions ───
  const recentTx = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  const fmt = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtDate = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

  // ─── Stat card helper ───
  const StatCard = ({ icon, iconBg, iconColor, label, value, change, changeLabel, onClick }) => (
    <Glass onClick={onClick} style={{
      padding: 20, cursor: onClick ? "pointer" : "default",
      transition: "all 0.2s", flex: "1 1 0",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, background: iconBg,
          display: "flex", alignItems: "center", justifyContent: "center", color: iconColor,
        }}>{icon}</div>
        {change !== undefined && change !== 0 && (
          <div style={{
            display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 8,
            background: change > 0 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700,
            color: change > 0 ? "#22C55E" : "#EF4444",
          }}>
            {change > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "var(--heading)", fontSize: 22, fontWeight: 800, color: "var(--text)", letterSpacing: -0.5 }}>{value}</div>
      {changeLabel && <div style={{ fontFamily: "var(--body)", fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{changeLabel}</div>}
    </Glass>
  );

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* ─── Header ─── */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="today-heading" style={{ fontFamily: "var(--heading)", fontSize: 28, fontWeight: 800, color: "var(--text)", margin: 0 }}>{greeting}</h1>
        <p style={{ fontFamily: "var(--body)", fontSize: 14, color: "var(--muted)", margin: "4px 0 0" }}>
          {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* ─── Top stat cards ─── */}
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
        <StatCard
          icon={<DollarSign size={20} />}
          iconBg="rgba(34,197,94,0.12)" iconColor="#22C55E"
          label="Income" value={`$${fmt(monthIncome)}`}
          change={incomeChange} changeLabel="vs last month"
        />
        <StatCard
          icon={<TrendingDown size={20} />}
          iconBg="rgba(239,68,68,0.12)" iconColor="#EF4444"
          label="Expenses" value={`$${fmt(monthExpenses)}`}
          change={-expenseChange} changeLabel="vs last month"
        />
        <StatCard
          icon={<PiggyBank size={20} />}
          iconBg="rgba(99,102,241,0.12)" iconColor="#6366F1"
          label="Net This Month"
          value={`${monthNet >= 0 ? "" : "-"}$${fmt(Math.abs(monthNet))}`}
          changeLabel={`${savingsRate >= 0 ? "" : ""}${savingsRate.toFixed(1)}% savings rate`}
        />
        <StatCard
          icon={<Wallet size={20} />}
          iconBg="rgba(139,92,246,0.12)" iconColor="#8B5CF6"
          label="Net Worth" value={`${netWorth >= 0 ? "" : "-"}$${fmt(Math.abs(netWorth))}`}
          changeLabel={`${accounts.length} account${accounts.length !== 1 ? "s" : ""}`}
          onClick={() => setPage("finance")}
        />
      </div>

      {/* ─── Main content: two columns ─── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, alignItems: "start" }}>
        {/* ─── Left column ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Income vs Expenses trend */}
          <Glass style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: "var(--heading)", fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Monthly Trend</div>
                <div style={{ fontFamily: "var(--body)", fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Last 6 months income vs expenses</div>
              </div>
              <BarChart3 size={18} color="var(--muted)" />
            </div>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontFamily: "var(--mono)", fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontFamily: "var(--mono)", fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="income" name="Income" fill="#22C55E" radius={[4,4,0,0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Glass>

          {/* Recent transactions */}
          <Glass style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: "var(--heading)", fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Recent Transactions</div>
                <div style={{ fontFamily: "var(--body)", fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{transactions.length} total</div>
              </div>
              <div onClick={() => setPage("finance")} style={{
                padding: "6px 14px", borderRadius: 8, cursor: "pointer",
                fontFamily: "var(--body)", fontSize: 11, fontWeight: 600, color: "var(--primary)",
                background: "var(--primary-bg)", transition: "all 0.15s",
              }}>View All</div>
            </div>
            {recentTx.length === 0 && (
              <div style={{ textAlign: "center", padding: "30px 0", color: "var(--muted)", fontFamily: "var(--body)", fontSize: 13 }}>
                No transactions yet. Add your first one!
              </div>
            )}
            {recentTx.map((tx, i) => {
              const cat = getCat(tx.category);
              const isIncome = tx.type === "income";
              return (
                <div key={tx.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 0",
                  borderBottom: i < recentTx.length - 1 ? "1px solid var(--border-light)" : "none",
                  animation: `slideUp 0.3s ${i * 0.05}s both ease-out`,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: `${cat.color}14`, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {isIncome ? <ArrowUpRight size={16} color="#22C55E" /> : <ArrowDownRight size={16} color={cat.color} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--body)", fontSize: 13, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {tx.description || cat.label}
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
                      {fmtDate(tx.date)} &middot; {cat.label}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700,
                    color: isIncome ? "#22C55E" : "var(--text)",
                  }}>
                    {isIncome ? "+" : "-"}${fmt(tx.amount)}
                  </div>
                </div>
              );
            })}
          </Glass>
        </div>

        {/* ─── Right column ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Spending breakdown donut */}
          <Glass style={{ padding: 20 }}>
            <div style={{ fontFamily: "var(--heading)", fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Spending Breakdown</div>
            {categorySpending.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "var(--muted)", fontFamily: "var(--body)", fontSize: 13 }}>No expenses this month</div>
            ) : (
              <>
                <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categorySpending} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} strokeWidth={0}>
                        {categorySpending.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ marginTop: 8 }}>
                  {categorySpending.slice(0, 5).map((cat, i) => (
                    <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: cat.color, flexShrink: 0 }} />
                      <span style={{ fontFamily: "var(--body)", fontSize: 12, color: "var(--muted)", flex: 1 }}>{cat.name}</span>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, color: "var(--text)" }}>${fmt(cat.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Glass>

          {/* Budget health */}
          {budgetItems.length > 0 && (
            <Glass style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontFamily: "var(--heading)", fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Budget Health</div>
                {overBudgetCount > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 8, background: "rgba(239,68,68,0.1)", fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, color: "#EF4444" }}>
                    <AlertTriangle size={12} /> {overBudgetCount} over
                  </div>
                )}
              </div>
              {budgetItems.map((b, i) => {
                const barColor = b.pct > 100 ? "#EF4444" : b.pct > 80 ? "#F59E0B" : "#22C55E";
                return (
                  <div key={b.categoryId} style={{ marginBottom: i < budgetItems.length - 1 ? 14 : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--body)", fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{b.label}</span>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: b.pct > 100 ? "#EF4444" : "var(--muted)" }}>
                        ${fmt(b.spent)} / ${fmt(b.limit)}
                      </span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "var(--subtle-bg)", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 3, background: barColor, width: `${Math.min(b.pct, 100)}%`, transition: "width 0.5s ease" }} />
                    </div>
                  </div>
                );
              })}
            </Glass>
          )}

          {/* Upcoming bills */}
          <Glass style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontFamily: "var(--heading)", fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Upcoming Bills</div>
              <Calendar size={16} color="var(--muted)" />
            </div>
            {upcomingBills.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "var(--muted)", fontFamily: "var(--body)", fontSize: 13 }}>
                All bills paid this month
              </div>
            ) : upcomingBills.map((bill, i) => {
              const cat = getCat(bill.category);
              const daysUntil = bill.dueDay - today;
              return (
                <div key={`${bill.id}-${bill.dueDay}`} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 0",
                  borderBottom: i < upcomingBills.length - 1 ? "1px solid var(--border-light)" : "none",
                  opacity: bill.paid ? 0.5 : 1,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: bill.paid ? "rgba(34,197,94,0.1)" : `${cat.color}14`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Receipt size={14} color={bill.paid ? "#22C55E" : cat.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: "var(--body)", fontSize: 12, fontWeight: 600, color: "var(--text)",
                      textDecoration: bill.paid ? "line-through" : "none",
                    }}>{bill.name}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: daysUntil <= 3 && !bill.paid ? "#EF4444" : "var(--muted)" }}>
                      {bill.paid ? "Paid" : daysUntil === 0 ? "Due today" : daysUntil === 1 ? "Due tomorrow" : `Due in ${daysUntil} days`}
                    </div>
                  </div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>${fmt(bill.amount)}</div>
                </div>
              );
            })}
          </Glass>

          {/* Account summary */}
          {accounts.length > 0 && (
            <Glass style={{ padding: 20 }}>
              <div style={{ fontFamily: "var(--heading)", fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Accounts</div>
              {accounts.map((acct, i) => {
                const isLiability = ["credit", "loan"].includes(acct.type);
                return (
                  <div key={acct.id} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 0",
                    borderBottom: i < accounts.length - 1 ? "1px solid var(--border-light)" : "none",
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: isLiability ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {isLiability ? <CreditCard size={14} color="#EF4444" /> : <Wallet size={14} color="#22C55E" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--body)", fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{acct.name}</div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", textTransform: "capitalize" }}>{acct.type}</div>
                    </div>
                    <div style={{
                      fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700,
                      color: isLiability ? "#EF4444" : "#22C55E",
                    }}>
                      {isLiability ? "-" : ""}${fmt(Math.abs(acct.balance))}
                    </div>
                  </div>
                );
              })}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border-light)" }}>
                <span style={{ fontFamily: "var(--body)", fontSize: 12, fontWeight: 700, color: "var(--text)" }}>Net Worth</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 800, color: netWorth >= 0 ? "#22C55E" : "#EF4444" }}>
                  {netWorth >= 0 ? "" : "-"}${fmt(Math.abs(netWorth))}
                </span>
              </div>
            </Glass>
          )}
        </div>
      </div>
    </div>
  );
}
