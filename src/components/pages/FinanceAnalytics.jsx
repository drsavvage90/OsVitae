import { useState } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown, PiggyBank, BarChart3 } from "lucide-react";
import { Glass } from "../ui";

const CHART_COLORS = ["#EF4444","#F97316","#FBBF24","#22C55E","#14B8A6","#6366F1","#8B5CF6","#EC4899","#5B8DEF","#94A3B8"];

function getMonthlyData(transactions, bills, months = 12) {
  const now = new Date();
  const data = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString("en-US", { month: "short", year: i > 11 ? "2-digit" : undefined });
    const monthTx = transactions.filter(t => t.date?.startsWith(key));
    const income = monthTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const txExpense = monthTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const billExpense = bills.reduce((s, b) => s + b.amount, 0); // bills are monthly
    const expenses = txExpense + billExpense;
    data.push({ month: label, key, income, expenses, net: income - expenses, savings: income > 0 ? ((income - expenses) / income * 100) : 0 });
  }
  return data;
}

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
            {p.name === "Savings Rate" ? `${p.value.toFixed(1)}%` : `$${p.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function FinanceAnalytics({ transactions, bills, budgets, getCategories }) {
  const [chartView, setChartView] = useState("spending");
  const cats = getCategories();
  const allCats = [...cats.income, ...cats.expense];
  const getCat = (id) => allCats.find(c => c.id === id) || { label: id, color: "#94A3B8" };

  const monthlyData = getMonthlyData(transactions, bills, 12);

  // Category spending for donut
  const totalBillsExpense = bills.reduce((s, b) => s + b.amount, 0);
  const txExpenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = txExpenses + totalBillsExpense;

  const categoryData = cats.expense.map(cat => {
    const txSpent = transactions.filter(t => t.type === "expense" && t.category === cat.id).reduce((s, t) => s + t.amount, 0);
    const billSpent = bills.filter(b => b.category === cat.id).reduce((s, b) => s + b.amount, 0);
    return { name: cat.label, value: txSpent + billSpent, color: cat.color, id: cat.id };
  }).filter(c => c.value > 0).sort((a, b) => b.value - a.value);

  // Budget vs Actual
  const budgetData = cats.expense.map(cat => {
    const budget = budgets.find(b => b.categoryId === cat.id);
    const limit = budget ? budget.limit : 0;
    const txSpent = transactions.filter(t => t.type === "expense" && t.category === cat.id).reduce((s, t) => s + t.amount, 0);
    const billSpent = bills.filter(b => b.category === cat.id).reduce((s, b) => s + b.amount, 0);
    const spent = txSpent + billSpent;
    return { name: cat.label, budget: limit, actual: spent, color: cat.color };
  }).filter(c => c.budget > 0 || c.actual > 0);

  // Savings rate
  const currentMonth = monthlyData[monthlyData.length - 1];
  const avgSavingsRate = monthlyData.filter(m => m.income > 0).length > 0
    ? monthlyData.filter(m => m.income > 0).reduce((s, m) => s + m.savings, 0) / monthlyData.filter(m => m.income > 0).length
    : 0;

  // YoY data
  const now = new Date();
  const thisYear = now.getFullYear();
  const lastYear = thisYear - 1;
  const yoyData = [];
  for (let m = 0; m < 12; m++) {
    const thisKey = `${thisYear}-${String(m + 1).padStart(2, "0")}`;
    const lastKey = `${lastYear}-${String(m + 1).padStart(2, "0")}`;
    const label = new Date(thisYear, m, 1).toLocaleDateString("en-US", { month: "short" });
    const thisSpend = transactions.filter(t => t.type === "expense" && t.date?.startsWith(thisKey)).reduce((s, t) => s + t.amount, 0)
      + (m <= now.getMonth() ? bills.reduce((s, b) => s + b.amount, 0) : 0);
    const lastSpend = transactions.filter(t => t.type === "expense" && t.date?.startsWith(lastKey)).reduce((s, t) => s + t.amount, 0)
      + bills.reduce((s, b) => s + b.amount, 0);
    yoyData.push({ month: label, [thisYear]: thisSpend, [lastYear]: lastSpend });
  }

  const views = [
    { id: "spending", label: "Spending Trends" },
    { id: "categories", label: "Categories" },
    { id: "budget", label: "Budget vs Actual" },
    { id: "cashflow", label: "Cash Flow" },
    { id: "savings", label: "Savings Rate" },
    { id: "yoy", label: "Year over Year" },
  ];

  const tabStyle = (active) => ({
    padding: "6px 14px", borderRadius: 8, cursor: "pointer",
    fontFamily: "var(--body)", fontSize: 12, fontWeight: 600,
    background: active ? "var(--text)" : "transparent",
    color: active ? "var(--text-on-primary)" : "var(--muted)",
    transition: "all 0.2s", whiteSpace: "nowrap",
  });

  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--subtle-bg)", borderRadius: 10, padding: 4, overflowX: "auto" }}>
        {views.map(v => <div key={v.id} onClick={() => setChartView(v.id)} style={tabStyle(chartView === v.id)}>{v.label}</div>)}
      </div>

      {/* 1. Spending Over Time */}
      {chartView === "spending" && (
        <Glass style={{ padding: 20 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16, fontWeight: 600 }}>Monthly Spending Trends</div>
          {monthlyData.some(m => m.expenses > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontFamily: "var(--mono)", fontSize: 10, fill: "var(--muted)" }} axisLine={{ stroke: "var(--border)" }} />
                <YAxis tick={{ fontFamily: "var(--mono)", fontSize: 10, fill: "var(--muted)" }} axisLine={{ stroke: "var(--border)" }} tickFormatter={v => `$${v.toLocaleString()}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: "center", padding: 40, color: "var(--muted)", fontFamily: "var(--body)", fontSize: 14 }}>
              <BarChart3 size={32} style={{ marginBottom: 12, opacity: 0.5 }} /><br />
              Add transactions to see spending trends
            </div>
          )}
        </Glass>
      )}

      {/* 2. Category Breakdown Donut */}
      {chartView === "categories" && (
        <Glass style={{ padding: 20 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16, fontWeight: 600 }}>Spending by Category</div>
          {categoryData.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value" stroke="none">
                    {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                {categoryData.map(cat => (
                  <div key={cat.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: cat.color, flexShrink: 0 }} />
                    <span style={{ fontFamily: "var(--body)", fontSize: 13, color: "var(--text)", flex: 1 }}>{cat.name}</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600, color: "var(--text)" }}>${cat.value.toFixed(2)}</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", minWidth: 40, textAlign: "right" }}>{((cat.value / totalExpenses) * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 40, color: "var(--muted)", fontFamily: "var(--body)", fontSize: 14 }}>
              No spending data to display
            </div>
          )}
        </Glass>
      )}

      {/* 3. Budget vs Actual */}
      {chartView === "budget" && (
        <Glass style={{ padding: 20 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16, fontWeight: 600 }}>Budget vs Actual Spending</div>
          {budgetData.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(budgetData.length * 50 + 40, 200)}>
              <BarChart data={budgetData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontFamily: "var(--mono)", fontSize: 10, fill: "var(--muted)" }} tickFormatter={v => `$${v.toLocaleString()}`} />
                <YAxis type="category" dataKey="name" tick={{ fontFamily: "var(--body)", fontSize: 11, fill: "var(--text)" }} width={75} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="budget" name="Budget" fill="#5B8DEF" opacity={0.4} radius={[0, 4, 4, 0]} barSize={16} />
                <Bar dataKey="actual" name="Actual" fill="#EF4444" opacity={0.85} radius={[0, 4, 4, 0]} barSize={16} />
                <Legend wrapperStyle={{ fontFamily: "var(--body)", fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: "center", padding: 40, color: "var(--muted)", fontFamily: "var(--body)", fontSize: 14 }}>
              Set budgets in the Budget tab to see comparison
            </div>
          )}
        </Glass>
      )}

      {/* 4. Cash Flow */}
      {chartView === "cashflow" && (
        <Glass style={{ padding: 20 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16, fontWeight: 600 }}>Cash Flow — Income vs Expenses</div>
          {monthlyData.some(m => m.income > 0 || m.expenses > 0) ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Avg Monthly Income</div>
                  <div style={{ fontFamily: "var(--heading)", fontSize: 22, fontWeight: 800, color: "#22C55E" }}>
                    ${(monthlyData.reduce((s, m) => s + m.income, 0) / monthlyData.length).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Avg Monthly Expenses</div>
                  <div style={{ fontFamily: "var(--heading)", fontSize: 22, fontWeight: 800, color: "#EF4444" }}>
                    ${(monthlyData.reduce((s, m) => s + m.expenses, 0) / monthlyData.length).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Avg Net</div>
                  {(() => { const avg = monthlyData.reduce((s, m) => s + m.net, 0) / monthlyData.length; return (
                    <div style={{ fontFamily: "var(--heading)", fontSize: 22, fontWeight: 800, color: avg >= 0 ? "#22C55E" : "#EF4444" }}>
                      {avg >= 0 ? "+" : "-"}${Math.abs(avg).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                  ); })()}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontFamily: "var(--mono)", fontSize: 10, fill: "var(--muted)" }} />
                  <YAxis tick={{ fontFamily: "var(--mono)", fontSize: 10, fill: "var(--muted)" }} tickFormatter={v => `$${v.toLocaleString()}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontFamily: "var(--body)", fontSize: 11 }} />
                  <Bar dataKey="income" name="Income" fill="#22C55E" radius={[4, 4, 0, 0]} opacity={0.85} />
                  <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: 40, color: "var(--muted)", fontFamily: "var(--body)", fontSize: 14 }}>
              Add income and expenses to see cash flow
            </div>
          )}
        </Glass>
      )}

      {/* 5. Savings Rate */}
      {chartView === "savings" && (
        <Glass style={{ padding: 20 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16, fontWeight: 600 }}>Savings Rate</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            <Glass style={{ padding: 18, textAlign: "center" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>This Month</div>
              <div style={{ fontFamily: "var(--heading)", fontSize: 32, fontWeight: 800, color: (currentMonth?.savings || 0) >= 0 ? "#22C55E" : "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {(currentMonth?.savings || 0) >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                {(currentMonth?.savings || 0).toFixed(1)}%
              </div>
            </Glass>
            <Glass style={{ padding: 18, textAlign: "center" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>12-Month Average</div>
              <div style={{ fontFamily: "var(--heading)", fontSize: 32, fontWeight: 800, color: avgSavingsRate >= 0 ? "#22C55E" : "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <PiggyBank size={24} />
                {avgSavingsRate.toFixed(1)}%
              </div>
            </Glass>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontFamily: "var(--mono)", fontSize: 10, fill: "var(--muted)" }} />
              <YAxis tick={{ fontFamily: "var(--mono)", fontSize: 10, fill: "var(--muted)" }} tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="savings" name="Savings Rate" stroke="#22C55E" strokeWidth={2.5} dot={{ r: 4, fill: "#22C55E" }} activeDot={{ r: 6 }} />
              {/* Reference line at 0% */}
              <CartesianGrid y={0} />
            </LineChart>
          </ResponsiveContainer>
        </Glass>
      )}

      {/* 9. Year over Year */}
      {chartView === "yoy" && (
        <Glass style={{ padding: 20 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16, fontWeight: 600 }}>Year-over-Year Spending Comparison</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yoyData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontFamily: "var(--mono)", fontSize: 10, fill: "var(--muted)" }} />
              <YAxis tick={{ fontFamily: "var(--mono)", fontSize: 10, fill: "var(--muted)" }} tickFormatter={v => `$${v.toLocaleString()}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontFamily: "var(--body)", fontSize: 11 }} />
              <Bar dataKey={lastYear} name={String(lastYear)} fill="#94A3B8" radius={[4, 4, 0, 0]} opacity={0.5} />
              <Bar dataKey={thisYear} name={String(thisYear)} fill="#5B8DEF" radius={[4, 4, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </Glass>
      )}
    </div>
  );
}
