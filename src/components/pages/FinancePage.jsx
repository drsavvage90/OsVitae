import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, DollarSign, Repeat, Trash2, Receipt, Wallet, Check, X, Pencil, Plus } from "lucide-react";
import { Glass, Btn, ConfirmModal } from "../ui";

export default function FinancePage({
  transactions, financeTab, setFinanceTab, setShowNewTransaction,
  deleteTransaction, setEditingTransaction, saveBudget, addIncome, togglePaid, addBill, deleteBill, setEditingBill,
  budgets, editingBudget, setEditingBudget, editBudgetVal, setEditBudgetVal,
  newIncomeCategory, setNewIncomeCategory, newIncomeAmount, setNewIncomeAmount,
  newIncomeDesc, setNewIncomeDesc, newIncomeRecurring, setNewIncomeRecurring,
  bills, billPayments,
  newBillName, setNewBillName, newBillAmount, setNewBillAmount,
  newBillDueDay, setNewBillDueDay, newBillCategory, setNewBillCategory,
  inputStyle,
  getCategories, addCategory, renameCategory, deleteCategory,
}) {
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [renamingCat, setRenamingCat] = useState(null);
  const [renameVal, setRenameVal] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);

  const cats = getCategories();
  const allCats = [...cats.income, ...cats.expense];
  // Bills auto-count as monthly expenses
  const totalBillsExpense = bills.reduce((s, b) => s + b.amount, 0);
  const txExpenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = txExpenses + totalBillsExpense;
  const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;
  const recurringExpenses = totalBillsExpense + transactions.filter(t => t.type === "expense" && t.recurring).reduce((s, t) => s + t.amount, 0);
  const getCat = (id) => allCats.find(c => c.id === id) || { label: id, color: "#94A3B8" };
  const spendingByCategory = cats.expense.map(cat => {
    const txSpent = transactions.filter(t => t.type === "expense" && t.category === cat.id).reduce((s, t) => s + t.amount, 0);
    const billSpent = bills.filter(b => b.category === cat.id).reduce((s, b) => s + b.amount, 0);
    return { ...cat, spent: txSpent + billSpent };
  }).filter(c => c.spent > 0).sort((a, b) => b.spent - a.spent);
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  const fTabStyle = (t) => ({ padding:"8px 20px",borderRadius:10,cursor:"pointer",fontFamily:"var(--body)",fontSize:13,fontWeight:600,background:financeTab===t?"var(--text)":"transparent",color:financeTab===t?"var(--text-on-primary)":"var(--muted)",transition:"all 0.2s" });
  const fmtDate = (d) => new Date(d+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"});

  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:0,fontWeight:800 }}>Finance</h1>
          <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",margin:"4px 0 0" }}>{transactions.length} transactions this month</p>
        </div>
        <Btn primary onClick={() => setShowNewTransaction(true)}>+ Add Transaction</Btn>
      </div>

      <div className="stats-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:14,marginBottom:24 }}>
        {[
          { label:"Income",value:`$${totalIncome.toLocaleString("en-US",{minimumFractionDigits:2})}`,icon:<ArrowUpRight size={20}/>,color:"#22C55E" },
          { label:"Expenses",value:`$${totalExpenses.toLocaleString("en-US",{minimumFractionDigits:2})}`,icon:<ArrowDownRight size={20}/>,color:"#EF4444" },
          { label:"Net Balance",value:`${netBalance>=0?"+":""}$${Math.abs(netBalance).toLocaleString("en-US",{minimumFractionDigits:2})}`,icon:<DollarSign size={20}/>,color:netBalance>=0?"#22C55E":"#EF4444" },
          { label:"Recurring",value:`$${recurringExpenses.toLocaleString("en-US",{minimumFractionDigits:2})}/mo`,icon:<Repeat size={20}/>,color:"#5B8DEF" },
        ].map((m,i) => (
          <Glass key={i} style={{ padding:18,textAlign:"center" }}>
            <div style={{ display:"flex",justifyContent:"center",color:m.color,marginBottom:8 }}>{m.icon}</div>
            <div style={{ fontFamily:"var(--heading)",fontSize:20,fontWeight:800,color:m.color }}>{m.value}</div>
            <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",marginTop:2 }}>{m.label}</div>
          </Glass>
        ))}
      </div>

      <div style={{ display:"flex",gap:4,marginBottom:20,background:"var(--subtle-bg)",borderRadius:12,padding:4,width:"fit-content" }}>
        {["Transactions","Income","Bills","Budget","Summary"].map(t => <div key={t} onClick={() => setFinanceTab(t)} style={fTabStyle(t)}>{t}</div>)}
      </div>

      {financeTab === "Transactions" && (
        <div>
          {sortedTransactions.filter(tx => tx.type === "expense" || (tx.type === "income" && !tx.recurring)).map((tx,i) => { const cat = getCat(tx.category); return (
            <Glass key={tx.id} style={{ padding:16,marginBottom:8,display:"flex",alignItems:"center",gap:14,animation:`slideUp 0.3s ${i*0.04}s both ease-out` }}>
              <div style={{ width:40,height:40,borderRadius:12,background:`${cat.color}14`,display:"flex",alignItems:"center",justifyContent:"center",color:cat.color }}>
                {tx.type==="income"?<ArrowUpRight size={20}/>:<ArrowDownRight size={20}/>}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <span style={{ fontFamily:"var(--heading)",fontSize:14,fontWeight:700,color:"var(--text)" }}>{tx.description}</span>
                  {tx.recurring && <Repeat size={12} color="var(--muted)"/>}
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:2 }}>
                  <span style={{ fontFamily:"var(--mono)",fontSize:10,color:cat.color,background:`${cat.color}14`,padding:"1px 6px",borderRadius:4,fontWeight:600 }}>{cat.label}</span>
                  <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{fmtDate(tx.date)}</span>
                </div>
              </div>
              <div style={{ textAlign:"right",display:"flex",alignItems:"center",gap:10 }}>
                <span style={{ fontFamily:"var(--mono)",fontSize:14,fontWeight:700,color:tx.type==="income"?"#22C55E":"#EF4444" }}>
                  {tx.type==="income"?"+":"-"}${tx.amount.toFixed(2)}
                </span>
                <div role="button" onClick={() => setEditingTransaction(tx)} style={{ width:28,height:28,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--muted)",transition:"all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.color="var(--primary)"; e.currentTarget.style.background="var(--subtle-bg)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color="var(--muted)"; e.currentTarget.style.background="transparent"; }}
                ><Pencil size={14}/></div>
                <div role="button" onClick={() => deleteTransaction(tx.id)} style={{ width:28,height:28,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--muted)",transition:"all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.color="#EF4444"; e.currentTarget.style.background="rgba(239,68,68,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color="var(--muted)"; e.currentTarget.style.background="transparent"; }}
                ><Trash2 size={14}/></div>
              </div>
            </Glass>
          ); })}
          {sortedTransactions.length===0 && <Glass style={{ padding:40,textAlign:"center" }}><Receipt size={32} color="var(--muted)" style={{ marginBottom:12 }}/><div style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)" }}>No transactions yet. Add your first one!</div></Glass>}
        </div>
      )}

      {financeTab === "Income" && (() => {
        const incomeTransactions = transactions.filter(t => t.type === "income").sort((a, b) => new Date(b.date) - new Date(a.date));
        const totalMonthlyIncome = incomeTransactions.filter(t => t.recurring).reduce((s, t) => s + t.amount, 0);
        const totalAllIncome = incomeTransactions.reduce((s, t) => s + t.amount, 0);
        return (
        <div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20 }}>
            <Glass style={{ padding:18,textAlign:"center" }}>
              <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:4 }}>Recurring Monthly</div>
              <div style={{ fontFamily:"var(--heading)",fontSize:28,fontWeight:800,color:"#22C55E" }}>${totalMonthlyIncome.toLocaleString("en-US",{minimumFractionDigits:2})}</div>
            </Glass>
            <Glass style={{ padding:18,textAlign:"center" }}>
              <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:4 }}>Total Income</div>
              <div style={{ fontFamily:"var(--heading)",fontSize:28,fontWeight:800,color:"var(--text)" }}>${totalAllIncome.toLocaleString("en-US",{minimumFractionDigits:2})}</div>
            </Glass>
          </div>

          <Glass style={{ padding:18,marginBottom:20 }}>
            <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:14,fontWeight:600 }}>Add Income</div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:12 }}>
              {cats.income.map(cat => (
                <div key={cat.id} onClick={() => setNewIncomeCategory(cat.id)} style={{
                  padding:"6px 12px",borderRadius:8,cursor:"pointer",
                  background:newIncomeCategory===cat.id?`${cat.color}18`:"var(--hover-bg)",
                  border:newIncomeCategory===cat.id?`2px solid ${cat.color}`:"2px solid transparent",
                  fontFamily:"var(--body)",fontSize:11,fontWeight:600,color:newIncomeCategory===cat.id?cat.color:"var(--muted)",
                  transition:"all 0.15s",
                }}>{cat.label}</div>
              ))}
            </div>
            <div style={{ display:"flex",gap:10,marginBottom:12 }}>
              <input value={newIncomeDesc} onChange={e => setNewIncomeDesc(e.target.value)} placeholder="e.g. Day job, Side project..."
                onKeyDown={e => e.key === "Enter" && addIncome()}
                style={{ ...inputStyle, flex:2 }} />
              <div style={{ position:"relative",flex:1 }}>
                <span style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontFamily:"var(--mono)",fontSize:13,color:"var(--muted)" }}>$</span>
                <input value={newIncomeAmount} onChange={e => setNewIncomeAmount(e.target.value)} placeholder="0.00" type="number" step="0.01"
                  onKeyDown={e => e.key === "Enter" && addIncome()}
                  style={{ ...inputStyle, paddingLeft:24 }} />
              </div>
            </div>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <label onClick={() => setNewIncomeRecurring(!newIncomeRecurring)} style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",fontWeight:600 }}>
                <div style={{ width:18,height:18,borderRadius:5,border:newIncomeRecurring?"none":"2px solid var(--checkbox-border)",background:newIncomeRecurring?"#22C55E":"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s" }}>
                  {newIncomeRecurring && <Check size={12} color="#fff"/>}
                </div>
                Recurring (monthly)
              </label>
              <Btn primary onClick={addIncome}>+ Add Income</Btn>
            </div>
          </Glass>

          {incomeTransactions.map((tx, i) => { const cat = getCat(tx.category); return (
            <Glass key={tx.id} style={{ padding:16,marginBottom:8,display:"flex",alignItems:"center",gap:14,animation:`slideUp 0.3s ${i*0.04}s both ease-out` }}>
              <div style={{ width:40,height:40,borderRadius:12,background:"rgba(34,197,94,0.1)",display:"flex",alignItems:"center",justifyContent:"center",color:"#22C55E" }}>
                <ArrowUpRight size={20}/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <span style={{ fontFamily:"var(--heading)",fontSize:14,fontWeight:700,color:"var(--text)" }}>{tx.description}</span>
                  {tx.recurring && <Repeat size={12} color="var(--muted)"/>}
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:2 }}>
                  <span style={{ fontFamily:"var(--mono)",fontSize:10,color:cat.color,background:`${cat.color}14`,padding:"1px 6px",borderRadius:4,fontWeight:600 }}>{cat.label}</span>
                  <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{fmtDate(tx.date)}</span>
                </div>
              </div>
              <div style={{ textAlign:"right",display:"flex",alignItems:"center",gap:10 }}>
                <span style={{ fontFamily:"var(--mono)",fontSize:14,fontWeight:700,color:"#22C55E" }}>+${tx.amount.toFixed(2)}</span>
                <div role="button" onClick={() => setEditingTransaction(tx)} style={{ width:28,height:28,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--muted)",transition:"all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.color="var(--primary)"; e.currentTarget.style.background="var(--subtle-bg)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color="var(--muted)"; e.currentTarget.style.background="transparent"; }}
                ><Pencil size={14}/></div>
                <div role="button" onClick={() => deleteTransaction(tx.id)} style={{ width:28,height:28,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--muted)",transition:"all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.color="#EF4444"; e.currentTarget.style.background="rgba(239,68,68,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color="var(--muted)"; e.currentTarget.style.background="transparent"; }}
                ><Trash2 size={14}/></div>
              </div>
            </Glass>
          ); })}
          {incomeTransactions.length===0 && <Glass style={{ padding:40,textAlign:"center" }}><Wallet size={32} color="var(--muted)" style={{ marginBottom:12 }}/><div style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)" }}>No income added yet. Add your sources above!</div></Glass>}
        </div>
        );
      })()}

      {financeTab === "Bills" && (() => {
        const now = new Date();
        const months = [];
        for (let i = 0; i < 12; i++) {
          const d = new Date(now.getFullYear(), i, 1);
          months.push({ key: d.toISOString().slice(0, 7), short: d.toLocaleDateString("en-US", { month: "short" }), full: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }), isCurrent: i === now.getMonth() });
        }
        const currentMonthKey = months.find(m => m.isCurrent).key;
        const totalBillsAmount = bills.reduce((s, b) => s + b.amount, 0);
        const paidThisMonth = bills.filter(b => {
          const dueDays = b.dueDays || [b.dueDay || 1];
          const paidCount = billPayments[`${b.id}-${currentMonthKey}`] || 0;
          return paidCount >= dueDays.length;
        }).length;
        const paidAmountThisMonth = bills.reduce((s, b) => {
          const dueDays = b.dueDays || [b.dueDay || 1];
          const paidCount = billPayments[`${b.id}-${currentMonthKey}`] || 0;
          return s + (b.amount * Math.min(paidCount, dueDays.length) / dueDays.length);
        }, 0);
        const sortedBills = [...bills].sort((a, b) => a.dueDay - b.dueDay);
        const cellW = 54;
        return (
        <div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:20 }}>
            <Glass style={{ padding:18,textAlign:"center" }}>
              <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:4 }}>Monthly Bills</div>
              <div style={{ fontFamily:"var(--heading)",fontSize:28,fontWeight:800,color:"var(--text)" }}>${totalBillsAmount.toLocaleString("en-US",{minimumFractionDigits:2})}</div>
            </Glass>
            <Glass style={{ padding:18,textAlign:"center" }}>
              <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:4 }}>Paid This Month</div>
              <div style={{ fontFamily:"var(--heading)",fontSize:28,fontWeight:800,color:"#22C55E" }}>${paidAmountThisMonth.toLocaleString("en-US",{minimumFractionDigits:2})}</div>
            </Glass>
            <Glass style={{ padding:18,textAlign:"center" }}>
              <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:4 }}>Remaining</div>
              <div style={{ fontFamily:"var(--heading)",fontSize:28,fontWeight:800,color:(totalBillsAmount-paidAmountThisMonth)<0?"#EF4444":"#5B8DEF" }}>${(totalBillsAmount - paidAmountThisMonth).toLocaleString("en-US",{minimumFractionDigits:2})}</div>
            </Glass>
          </div>

          {bills.length > 0 && (
            <div style={{ marginBottom:20 }}>
              <div style={{ height:8,background:"var(--subtle-bg)",borderRadius:8,overflow:"hidden" }}>
                <div style={{ width:`${bills.length > 0 ? (paidThisMonth/bills.length)*100 : 0}%`,height:"100%",borderRadius:8,background:"linear-gradient(90deg, #22C55E, #4ADE80)",transition:"width 0.5s" }}/>
              </div>
              <div style={{ fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)",marginTop:6,textAlign:"center" }}>{paidThisMonth} of {bills.length} bills paid for {months.find(m => m.isCurrent).full}</div>
            </div>
          )}

          <Glass style={{ padding:18,marginBottom:20 }}>
            <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:14,fontWeight:600 }}>Add Bill</div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:12 }}>
              {cats.expense.map(cat => (
                <div key={cat.id} onClick={() => setNewBillCategory(cat.id)} style={{
                  padding:"6px 12px",borderRadius:8,cursor:"pointer",
                  background:newBillCategory===cat.id?`${cat.color}18`:"var(--hover-bg)",
                  border:newBillCategory===cat.id?`2px solid ${cat.color}`:"2px solid transparent",
                  fontFamily:"var(--body)",fontSize:11,fontWeight:600,color:newBillCategory===cat.id?cat.color:"var(--muted)",
                  transition:"all 0.15s",
                }}>{cat.label}</div>
              ))}
            </div>
            <div style={{ display:"flex",gap:10,marginBottom:12 }}>
              <input value={newBillName} onChange={e => setNewBillName(e.target.value)} placeholder="e.g. Rent, Electric, Netflix..."
                onKeyDown={e => e.key === "Enter" && addBill()}
                style={{ ...inputStyle, flex:2 }} />
              <div style={{ position:"relative",flex:1 }}>
                <span style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontFamily:"var(--mono)",fontSize:13,color:"var(--muted)" }}>$</span>
                <input value={newBillAmount} onChange={e => setNewBillAmount(e.target.value)} placeholder="0.00" type="number" step="0.01"
                  onKeyDown={e => e.key === "Enter" && addBill()}
                  style={{ ...inputStyle, paddingLeft:24 }} />
              </div>
              <div style={{ position:"relative",flex:0.6 }}>
                <span style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>Due</span>
                <input value={newBillDueDay} onChange={e => setNewBillDueDay(e.target.value)} type="number" min="1" max="31"
                  onKeyDown={e => e.key === "Enter" && addBill()}
                  style={{ ...inputStyle, paddingLeft:36, textAlign:"center" }} />
              </div>
            </div>
            <div style={{ display:"flex",justifyContent:"flex-end" }}>
              <Btn primary onClick={addBill}>+ Add Bill</Btn>
            </div>
          </Glass>

          {bills.length > 0 && (
          <Glass style={{ padding:0,overflow:"hidden" }}>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%",borderCollapse:"collapse",fontFamily:"var(--body)",fontSize:13 }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid var(--border)" }}>
                    <th style={{ padding:"12px 16px",textAlign:"left",fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,fontWeight:600,position:"sticky",left:0,background:"var(--card-bg)",zIndex:2,minWidth:180 }}>Bill</th>
                    <th style={{ padding:"12px 8px",textAlign:"right",fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,fontWeight:600,minWidth:70 }}>Amount</th>
                    {months.map(m => (
                      <th key={m.key} style={{ padding:"12px 0",textAlign:"center",fontFamily:"var(--mono)",fontSize:10,color:m.isCurrent?"var(--text)":"var(--muted)",textTransform:"uppercase",letterSpacing:0.5,fontWeight:m.isCurrent?800:600,minWidth:cellW,background:m.isCurrent?"rgba(34,197,94,0.04)":"transparent" }}>{m.short}</th>
                    ))}
                    <th style={{ width:36 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedBills.map((bill, i) => {
                    const cat = getCat(bill.category);
                    return (
                    <tr key={bill.id} style={{ borderBottom:"1px solid var(--border-light)",animation:`slideUp 0.3s ${i*0.03}s both ease-out` }}>
                      <td style={{ padding:"10px 16px",position:"sticky",left:0,background:"var(--card-bg)",zIndex:1 }}>
                        <div style={{ fontFamily:"var(--heading)",fontSize:13,fontWeight:700,color:"var(--text)" }}>{bill.name}</div>
                        <div style={{ display:"flex",alignItems:"center",gap:6,marginTop:2 }}>
                          <span style={{ fontFamily:"var(--mono)",fontSize:9,color:cat.color,background:`${cat.color}14`,padding:"1px 5px",borderRadius:3,fontWeight:600 }}>{cat.label}</span>
                          <span style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)" }}>Due {(bill.dueDays || [bill.dueDay]).map(d => d === 1 ? "1st" : d === 2 ? "2nd" : d === 3 ? "3rd" : `${d}th`).join(", ")}</span>
                        </div>
                      </td>
                      <td style={{ padding:"10px 8px",textAlign:"right",fontFamily:"var(--mono)",fontSize:12,fontWeight:700,color:"var(--text)" }}>${bill.amount.toFixed(2)}</td>
                      {months.map(m => {
                        const dueDays = bill.dueDays || [bill.dueDay || 1];
                        const totalDue = dueDays.length;
                        const paidCount = billPayments[`${bill.id}-${m.key}`] || 0;
                        const fullyPaid = paidCount >= totalDue;
                        const partialPaid = paidCount > 0 && paidCount < totalDue;
                        return (
                        <td key={m.key} style={{ padding:"6px 0",textAlign:"center",background:m.isCurrent?"rgba(34,197,94,0.04)":"transparent" }}>
                          <div onClick={() => togglePaid(bill.id, m.key, totalDue)} style={{
                            width:24,height:24,borderRadius:6,margin:"0 auto",cursor:"pointer",
                            border:fullyPaid||partialPaid?"none":"2px solid var(--checkbox-border)",
                            background:fullyPaid?"#22C55E":partialPaid?"#FBBF24":"transparent",
                            display:"flex",alignItems:"center",justifyContent:"center",
                            transition:"all 0.15s",
                            position:"relative",overflow:"hidden",
                          }}>
                            {fullyPaid && <Check size={14} color="#fff"/>}
                            {partialPaid && (
                              <svg width="24" height="24" viewBox="0 0 24 24" style={{ position:"absolute" }}>
                                <line x1="4" y1="20" x2="20" y2="4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                              </svg>
                            )}
                          </div>
                        </td>
                        );
                      })}
                      <td style={{ padding:"6px 8px",display:"flex",gap:4 }}>
                        <div role="button" onClick={() => setEditingBill(bill)} style={{ width:28,height:28,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--muted)",transition:"all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.color="var(--primary)"; e.currentTarget.style.background="var(--subtle-bg)"; }}
                          onMouseLeave={e => { e.currentTarget.style.color="var(--muted)"; e.currentTarget.style.background="transparent"; }}
                        ><Pencil size={14}/></div>
                        <div role="button" onClick={() => deleteBill(bill.id)} style={{ width:28,height:28,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--muted)",transition:"all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.color="#EF4444"; e.currentTarget.style.background="rgba(239,68,68,0.08)"; }}
                          onMouseLeave={e => { e.currentTarget.style.color="var(--muted)"; e.currentTarget.style.background="transparent"; }}
                        ><Trash2 size={14}/></div>
                      </td>
                    </tr>
                    );
                  })}
                  <tr style={{ borderTop:"2px solid var(--border)" }}>
                    <td style={{ padding:"10px 16px",fontFamily:"var(--mono)",fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:0.5,position:"sticky",left:0,background:"var(--card-bg)" }}>Total</td>
                    <td style={{ padding:"10px 8px",textAlign:"right",fontFamily:"var(--mono)",fontSize:12,fontWeight:800,color:"var(--text)" }}>${totalBillsAmount.toFixed(2)}</td>
                    {months.map(m => {
                      const paidInMonth = sortedBills.filter(b => { const dd = b.dueDays || [b.dueDay || 1]; return (billPayments[`${b.id}-${m.key}`] || 0) >= dd.length; }).length;
                      return (
                      <td key={m.key} style={{ padding:"10px 0",textAlign:"center",fontFamily:"var(--mono)",fontSize:10,fontWeight:700,color:paidInMonth===sortedBills.length&&sortedBills.length>0?"#22C55E":"var(--muted)",background:m.isCurrent?"rgba(34,197,94,0.04)":"transparent" }}>
                        {paidInMonth}/{sortedBills.length}
                      </td>
                      );
                    })}
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Glass>
          )}

          {bills.length===0 && <Glass style={{ padding:40,textAlign:"center" }}><Receipt size={32} color="var(--muted)" style={{ marginBottom:12 }}/><div style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)" }}>No bills added yet. Add your monthly bills above!</div></Glass>}
        </div>
        );
      })()}

      {financeTab === "Budget" && (
        <div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20 }}>
            <Glass style={{ padding:18,textAlign:"center" }}>
              <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:4 }}>Total Budget</div>
              <div style={{ fontFamily:"var(--heading)",fontSize:28,fontWeight:800,color:"var(--text)" }}>${budgets.reduce((s,b)=>s+b.limit,0).toLocaleString()}</div>
            </Glass>
            <Glass style={{ padding:18,textAlign:"center" }}>
              <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:4 }}>Total Spent</div>
              <div style={{ fontFamily:"var(--heading)",fontSize:28,fontWeight:800,color:totalExpenses>budgets.reduce((s,b)=>s+b.limit,0)?"#EF4444":"#22C55E" }}>${totalExpenses.toLocaleString("en-US",{minimumFractionDigits:2})}</div>
            </Glass>
          </div>
          {cats.expense.map((cat,i) => {
            const budget = budgets.find(b=>b.categoryId===cat.id); const limit = budget?budget.limit:0;
            const txSpent = transactions.filter(t=>t.type==="expense"&&t.category===cat.id).reduce((s,t)=>s+t.amount,0);
            const billSpent = bills.filter(b=>b.category===cat.id).reduce((s,b)=>s+b.amount,0);
            const spent = txSpent + billSpent;
            const pct = limit>0?Math.min((spent/limit)*100,100):0; const over = spent>limit&&limit>0;
            return (
              <Glass key={cat.id} style={{ padding:16,marginBottom:8,animation:`slideUp 0.3s ${i*0.04}s both ease-out` }}>
                <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:10 }}>
                  <div style={{ width:32,height:32,borderRadius:10,background:`${cat.color}14`,display:"flex",alignItems:"center",justifyContent:"center",color:cat.color }}><DollarSign size={16}/></div>
                  <div style={{ flex:1 }}>
                    {renamingCat===cat.id ? (
                      <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                        <input value={renameVal} onChange={e=>setRenameVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&renameVal.trim()){renameCategory(cat.id,renameVal.trim());setRenamingCat(null);}}}
                          style={{ width:120,padding:"4px 8px",borderRadius:6,border:"1px solid var(--border)",fontFamily:"var(--heading)",fontSize:14,fontWeight:700,outline:"none",background:"var(--subtle-bg)",color:"var(--text)" }} autoFocus/>
                        <div onClick={()=>{if(renameVal.trim()){renameCategory(cat.id,renameVal.trim());setRenamingCat(null);}}} style={{ cursor:"pointer",color:"#22C55E" }}><Check size={14}/></div>
                        <div onClick={()=>setRenamingCat(null)} style={{ cursor:"pointer",color:"var(--muted)" }}><X size={14}/></div>
                      </div>
                    ) : (
                      <span onClick={()=>{setRenamingCat(cat.id);setRenameVal(cat.label);}} style={{ fontFamily:"var(--heading)",fontSize:14,fontWeight:700,color:"var(--text)",cursor:"pointer" }} title="Click to rename">{cat.label}</span>
                    )}
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                    {editingBudget===cat.id ? (
                      <div style={{ display:"flex",alignItems:"center",gap:4 }}>
                        <span style={{ fontFamily:"var(--mono)",fontSize:12,color:"var(--muted)" }}>$</span>
                        <input value={editBudgetVal} onChange={e=>setEditBudgetVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&saveBudget(cat.id)}
                          style={{ width:70,padding:"4px 8px",borderRadius:6,border:"1px solid var(--border)",fontFamily:"var(--mono)",fontSize:12,outline:"none",background:"var(--subtle-bg)",color:"var(--text)" }} autoFocus/>
                        <div onClick={()=>saveBudget(cat.id)} style={{ cursor:"pointer",color:"#22C55E" }}><Check size={14}/></div>
                        <div onClick={()=>setEditingBudget(null)} style={{ cursor:"pointer",color:"var(--muted)" }}><X size={14}/></div>
                      </div>
                    ) : (
                      <>
                        <span style={{ fontFamily:"var(--mono)",fontSize:12,fontWeight:700,color:over?"#EF4444":"var(--text)" }}>${spent.toFixed(2)} / ${limit.toLocaleString()}</span>
                        <div onClick={()=>{setEditingBudget(cat.id);setEditBudgetVal(String(limit));}} style={{ cursor:"pointer",color:"var(--muted)" }}><Pencil size={12}/></div>
                        <div onClick={()=>setConfirmDelete({ id: cat.id, title: cat.label })} style={{ cursor:"pointer",color:"var(--muted)" }}><Trash2 size={12}/></div>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ height:6,background:"var(--subtle-bg)",borderRadius:6,overflow:"hidden" }}>
                  <div style={{ width:`${pct}%`,height:"100%",borderRadius:6,background:over?"#EF4444":pct>75?"#FBBF24":cat.color,transition:"width 0.5s" }}/>
                </div>
                {over && <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"#EF4444",marginTop:4,fontWeight:600 }}>Over budget by ${(spent-limit).toFixed(2)}</div>}
              </Glass>
            );
          })}

          {/* Add new category */}
          {showAddCat ? (
            <Glass style={{ padding:16,marginBottom:8,display:"flex",alignItems:"center",gap:8 }}>
              <input value={newCatName} onChange={e=>setNewCatName(e.target.value)} placeholder="Category name"
                onKeyDown={e=>{if(e.key==="Enter"&&newCatName.trim()){addCategory("expense",newCatName.trim());setNewCatName("");setShowAddCat(false);}}}
                style={{ flex:1,padding:"8px 12px",borderRadius:8,border:"1px solid var(--border)",fontFamily:"var(--body)",fontSize:13,outline:"none",background:"var(--subtle-bg)",color:"var(--text)" }} autoFocus/>
              <div onClick={()=>{if(newCatName.trim()){addCategory("expense",newCatName.trim());setNewCatName("");setShowAddCat(false);}}} style={{ cursor:"pointer",color:"#22C55E" }}><Check size={16}/></div>
              <div onClick={()=>{setShowAddCat(false);setNewCatName("");}} style={{ cursor:"pointer",color:"var(--muted)" }}><X size={16}/></div>
            </Glass>
          ) : (
            <div onClick={()=>setShowAddCat(true)} style={{
              display:"flex",alignItems:"center",justifyContent:"center",gap:8,padding:14,borderRadius:12,
              border:"2px dashed var(--border)",cursor:"pointer",color:"var(--muted)",
              fontFamily:"var(--body)",fontSize:13,fontWeight:600,transition:"all 0.15s",
            }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--primary)";e.currentTarget.style.color="var(--primary)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--muted)";}}
            >
              <Plus size={16}/> Add Category
            </div>
          )}
        </div>
      )}

      {financeTab === "Summary" && (
        <div>
          <Glass style={{ padding:20,marginBottom:14 }}>
            <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:14,fontWeight:600 }}>Income vs Expenses</div>
            <div style={{ display:"flex",gap:12,alignItems:"flex-end",height:120,marginBottom:12 }}>
              {[
                { label:"Income",val:totalIncome,color:"#22C55E" },
                { label:"Expenses",val:totalExpenses,color:"#EF4444" },
                { label:"Net",val:Math.abs(netBalance),color:netBalance>=0?"#22C55E":"#EF4444",prefix:netBalance>=0?"+":"-" },
              ].map((bar,i) => (
                <div key={i} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6 }}>
                  <div style={{ fontFamily:"var(--mono)",fontSize:11,fontWeight:700,color:bar.color }}>{bar.prefix||""}${bar.val.toLocaleString()}</div>
                  <div style={{ width:"100%",borderRadius:8,position:"relative",height:`${Math.max((bar.val/Math.max(totalIncome,totalExpenses))*80,10)}px` }}>
                    <div style={{ position:"absolute",inset:0,background:bar.color,borderRadius:8,opacity:i===2?0.6:0.8 }}/>
                  </div>
                  <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{bar.label}</div>
                </div>
              ))}
            </div>
          </Glass>

          <Glass style={{ padding:20,marginBottom:14 }}>
            <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:14,fontWeight:600 }}>Spending Breakdown</div>
            {totalExpenses>0 && (
              <div style={{ display:"flex",height:24,borderRadius:8,overflow:"hidden",marginBottom:16 }}>
                {spendingByCategory.map(cat => <div key={cat.id} style={{ width:`${(cat.spent/totalExpenses)*100}%`,background:cat.color,minWidth:2,transition:"width 0.5s" }} title={`${cat.label}: $${cat.spent.toFixed(2)}`}/>)}
              </div>
            )}
            {spendingByCategory.map(cat => (
              <div key={cat.id} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
                <div style={{ width:10,height:10,borderRadius:3,background:cat.color,flexShrink:0 }}/>
                <span style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)",flex:1 }}>{cat.label}</span>
                <span style={{ fontFamily:"var(--mono)",fontSize:12,fontWeight:600,color:"var(--text)" }}>${cat.spent.toFixed(2)}</span>
                <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",minWidth:40,textAlign:"right" }}>{((cat.spent/totalExpenses)*100).toFixed(0)}%</span>
              </div>
            ))}
          </Glass>

          <Glass style={{ padding:20 }}>
            <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1,marginBottom:14,fontWeight:600 }}>Recurring Commitments</div>
            {transactions.filter(t=>t.recurring).sort((a,b)=>b.amount-a.amount).map(tx => { const cat=getCat(tx.category); return (
              <div key={tx.id} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
                <Repeat size={14} color={cat.color}/>
                <span style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)",flex:1 }}>{tx.description}</span>
                <span style={{ fontFamily:"var(--mono)",fontSize:10,color:cat.color,background:`${cat.color}14`,padding:"1px 6px",borderRadius:4,fontWeight:600 }}>{cat.label}</span>
                <span style={{ fontFamily:"var(--mono)",fontSize:12,fontWeight:700,color:tx.type==="income"?"#22C55E":"#EF4444" }}>{tx.type==="income"?"+":"-"}${tx.amount.toFixed(2)}</span>
              </div>
            ); })}
          </Glass>
        </div>
      )}

      <ConfirmModal
        item={confirmDelete}
        onConfirm={() => { deleteCategory(confirmDelete.id); setConfirmDelete(null); }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
