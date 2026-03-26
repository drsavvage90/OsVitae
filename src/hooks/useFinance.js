import { useState } from "react";
import { supabase } from "../lib/supabase";
import { getUserId } from "../lib/getUserId";
import { logger } from "../lib/logger";
import { validateAmount, validateName, sanitizeText } from "../lib/validate";
import { INIT_TRANSACTIONS, INIT_BUDGETS, FINANCE_CATEGORIES } from "../lib/constants";

export function useFinance(flash) {
  const [transactions, setTransactions] = useState(INIT_TRANSACTIONS);
  const [budgets, setBudgets] = useState(INIT_BUDGETS);
  const [customCategories, setCustomCategories] = useState(null); // null = not loaded yet

  // Merged categories: custom overrides defaults once loaded
  const getCategories = () => {
    if (!customCategories) return FINANCE_CATEGORIES;
    const income = customCategories.filter(c => c.type === "income").sort((a, b) => a.sortOrder - b.sortOrder);
    const expense = customCategories.filter(c => c.type === "expense").sort((a, b) => a.sortOrder - b.sortOrder);
    return {
      income: income.length > 0 ? income : FINANCE_CATEGORIES.income,
      expense: expense.length > 0 ? expense : FINANCE_CATEGORIES.expense,
    };
  };

  const addCategory = async (type, label) => {
    const catId = `custom_${crypto.randomUUID().slice(0, 8)}`;
    const colors = ["#EF4444","#F97316","#FBBF24","#22C55E","#14B8A6","#6366F1","#8B5CF6","#EC4899","#5B8DEF","#94A3B8"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const cats = getCategories();
    const sortOrder = (cats[type]?.length || 0);
    const newCat = { id: catId, label, color, icon: "DollarSign", type, sortOrder };
    setCustomCategories(prev => [...(prev || []), newCat]);
    flash("Category added!");
    const userId = await getUserId();
    if (!userId) return;
    const { error } = await supabase.from("finance_categories").insert({
      user_id: userId, category_id: catId, type, label, color, icon: "DollarSign", sort_order: sortOrder,
    });
    if (error) { logger.error("Failed to add category:", error); flash("Failed to save category."); }
  };

  const renameCategory = async (catId, newLabel) => {
    setCustomCategories(prev => (prev || []).map(c => c.id === catId ? { ...c, label: newLabel } : c));
    flash("Category renamed!");
    const userId = await getUserId();
    if (!userId) return;
    const { error } = await supabase.from("finance_categories").update({ label: newLabel }).eq("user_id", userId).eq("category_id", catId);
    if (error) logger.error("Failed to rename category:", error);
  };

  const deleteCategory = async (catId) => {
    setCustomCategories(prev => (prev || []).filter(c => c.id !== catId));
    flash("Category deleted!");
    const userId = await getUserId();
    if (!userId) return;
    const { error } = await supabase.from("finance_categories").delete().eq("user_id", userId).eq("category_id", catId);
    if (error) logger.error("Failed to delete category:", error);
  };

  const seedDefaultCategories = async () => {
    const userId = await getUserId();
    if (!userId) return;
    const allDefaults = [
      ...FINANCE_CATEGORIES.income.map((c, i) => ({ ...c, type: "income", sortOrder: i })),
      ...FINANCE_CATEGORIES.expense.map((c, i) => ({ ...c, type: "expense", sortOrder: i })),
    ];
    setCustomCategories(allDefaults);
    const rows = allDefaults.map(c => ({
      user_id: userId, category_id: c.id, type: c.type, label: c.label, color: c.color, icon: c.icon, sort_order: c.sortOrder,
    }));
    const { error } = await supabase.from("finance_categories").insert(rows);
    if (error) logger.error("Failed to seed categories:", error);
  };
  const [financeTab, setFinanceTab] = useState("Transactions");
  const [showNewTransaction, setShowNewTransaction] = useState(false);
  const [newTxType, setNewTxType] = useState("expense");
  const [newTxCategory, setNewTxCategory] = useState("food");
  const [newTxAmount, setNewTxAmount] = useState("");
  const [newTxDesc, setNewTxDesc] = useState("");
  const [newTxDate, setNewTxDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [newTxRecurring, setNewTxRecurring] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [editBudgetVal, setEditBudgetVal] = useState("");
  const [newIncomeCategory, setNewIncomeCategory] = useState("salary");
  const [newIncomeAmount, setNewIncomeAmount] = useState("");
  const [newIncomeDesc, setNewIncomeDesc] = useState("");
  const [newIncomeRecurring, setNewIncomeRecurring] = useState(true);
  const [bills, setBills] = useState([]);
  const [billPayments, setBillPayments] = useState({});
  const [newBillName, setNewBillName] = useState("");
  const [newBillAmount, setNewBillAmount] = useState("");
  const [newBillDueDay, setNewBillDueDay] = useState("1");
  const [newBillCategory, setNewBillCategory] = useState("rent");

  const addTransaction = async () => {
    if (!newTxAmount || !newTxDesc) return;
    const amtCheck = validateAmount(newTxAmount);
    if (!amtCheck.valid) { flash(amtCheck.error); return; }
    const txId = crypto.randomUUID();
    const amt = amtCheck.value;
    const txType = newTxType, txCat = newTxCategory, txDesc = newTxDesc, txDate = newTxDate, txRecurring = newTxRecurring;
    setTransactions(prev => [...prev, { id: txId, type: txType, category: txCat, amount: amt, description: txDesc, date: txDate, recurring: txRecurring }]);
    setShowNewTransaction(false);
    setNewTxAmount(""); setNewTxDesc(""); setNewTxRecurring(false);
    flash(`${txType === "income" ? "Income" : "Expense"} added: $${amt.toFixed(2)}`);
    const userId = await getUserId();
    if (!userId) return;
    const { error } = await supabase.from("transactions").insert({ id: txId, user_id: userId, type: txType, category: txCat, amount: amt, description: txDesc, transaction_date: txDate, recurring: txRecurring });
    if (error) { logger.error("Failed to save transaction:", error); setTransactions(prev => prev.filter(t => t.id !== txId)); flash("Failed to save transaction."); }
  };

  const deleteTransaction = async (id) => {
    const tx = transactions.find(t => t.id === id);
    setTransactions(prev => prev.filter(t => t.id !== id)); flash("Transaction deleted");
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) { logger.error("Failed to delete transaction:", error); if (tx) setTransactions(prev => [...prev, tx]); flash("Delete failed."); }
  };

  const saveBudget = async (catId) => {
    const val = parseFloat(editBudgetVal);
    if (isNaN(val) || val < 0) return;
    setBudgets(prev => { const exists = prev.find(b => b.categoryId === catId); if (exists) return prev.map(b => b.categoryId === catId ? { ...b, limit: val } : b); return [...prev, { categoryId: catId, limit: val }]; });
    setEditingBudget(null); flash("Budget updated");
    const userId = await getUserId();
    if (!userId) return;
    const { error } = await supabase.from("budgets").upsert({ user_id: userId, category_id: catId, budget_limit: val }, { onConflict: "user_id,category_id" });
    if (error) logger.error("Failed to save budget:", error);
  };

  const addIncome = async () => {
    if (!newIncomeAmount || !newIncomeDesc) return;
    const incAmtCheck = validateAmount(newIncomeAmount);
    if (!incAmtCheck.valid) { flash(incAmtCheck.error); return; }
    const incId = crypto.randomUUID();
    const incAmt = incAmtCheck.value;
    const incDate = new Date().toISOString().split("T")[0];
    const incCat = newIncomeCategory, incDesc = newIncomeDesc, incRecurring = newIncomeRecurring;
    setTransactions(prev => [...prev, { id: incId, type: "income", category: incCat, amount: incAmt, description: incDesc, date: incDate, recurring: incRecurring }]);
    setNewIncomeAmount(""); setNewIncomeDesc(""); setNewIncomeRecurring(true);
    flash("Income added!");
    const userId = await getUserId();
    if (!userId) return;
    const { error } = await supabase.from("transactions").insert({ id: incId, user_id: userId, type: "income", category: incCat, amount: incAmt, description: incDesc, transaction_date: incDate, recurring: incRecurring });
    if (error) { logger.error("Failed to save income:", error); setTransactions(prev => prev.filter(t => t.id !== incId)); flash("Failed to save income."); }
  };

  const togglePaid = async (billId, monthKey, totalDueDates) => {
    const key = `${billId}-${monthKey}`;
    const current = billPayments[key] || 0; // 0 = unpaid, 1..n = paid count
    const max = totalDueDates || 1;
    const next = current >= max ? 0 : current + 1;
    setBillPayments(prev => ({ ...prev, [key]: next }));
    flash(next === 0 ? "Marked unpaid" : next < max ? `${next} of ${max} paid` : "Fully paid!");
    const userId = await getUserId();
    if (!userId) return;
    if (next === 0) {
      await supabase.from("bill_payments").delete().eq("bill_id", billId).eq("month_key", monthKey);
    } else if (current === 0) {
      await supabase.from("bill_payments").insert({ user_id: userId, bill_id: billId, month_key: monthKey, paid_count: next });
    } else {
      await supabase.from("bill_payments").update({ paid_count: next }).eq("bill_id", billId).eq("month_key", monthKey);
    }
  };

  const addBill = async () => {
    if (!newBillName || !newBillAmount) return;
    const nameCheck = validateName(newBillName);
    if (!nameCheck.valid) { flash(nameCheck.error); return; }
    const billAmtCheck = validateAmount(newBillAmount);
    if (!billAmtCheck.valid) { flash(billAmtCheck.error); return; }
    const billId = crypto.randomUUID();
    const amt = billAmtCheck.value;
    const bName = newBillName, bDueDay = parseInt(newBillDueDay), bCat = newBillCategory;
    setBills(prev => [...prev, { id: billId, name: bName, amount: amt, dueDay: bDueDay, dueDays: [bDueDay], category: bCat }]);
    setBudgets(prev => {
      const existing = prev.find(b => b.categoryId === bCat);
      if (existing) return prev.map(b => b.categoryId === bCat ? { ...b, limit: b.limit + amt } : b);
      return [...prev, { categoryId: bCat, limit: amt }];
    });
    setNewBillName(""); setNewBillAmount(""); setNewBillDueDay("1");
    flash("Bill added & budget updated!");
    const userId = await getUserId();
    if (!userId) return;
    const { error } = await supabase.from("bills").insert({ id: billId, user_id: userId, name: bName, amount: amt, due_day: bDueDay, due_days: [bDueDay], category: bCat });
    if (error) { logger.error("Failed to save bill:", error); setBills(prev => prev.filter(b => b.id !== billId)); flash("Failed to save bill."); }
    const existingBudget = budgets.find(b => b.categoryId === bCat);
    const newLimit = existingBudget ? existingBudget.limit + amt : amt;
    await supabase.from("budgets").upsert({ user_id: userId, category_id: bCat, budget_limit: newLimit }, { onConflict: "user_id,category_id" });
  };

  const deleteBill = async (id) => {
    const bill = bills.find(b => b.id === id);
    setBills(prev => prev.filter(b => b.id !== id)); flash("Bill removed");
    const { error } = await supabase.from("bills").delete().eq("id", id);
    if (error) { logger.error("Failed to delete bill:", error); if (bill) setBills(prev => [...prev, bill]); flash("Delete failed."); }
  };

  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editingBill, setEditingBill] = useState(null);

  const updateTransaction = async (id, updates) => {
    const prev = transactions.find(t => t.id === id);
    setTransactions(ts => ts.map(t => t.id === id ? { ...t, ...updates } : t));
    setEditingTransaction(null);
    flash("Transaction updated!");
    const dbUpdates = {};
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.date !== undefined) dbUpdates.transaction_date = updates.date;
    if (updates.recurring !== undefined) dbUpdates.recurring = updates.recurring;
    const { error } = await supabase.from("transactions").update(dbUpdates).eq("id", id);
    if (error) { logger.error("Failed to update transaction:", error); if (prev) setTransactions(ts => ts.map(t => t.id === id ? prev : t)); flash("Update failed."); }
  };

  const updateBill = async (id, updates) => {
    const prev = bills.find(b => b.id === id);
    setBills(bs => bs.map(b => b.id === id ? { ...b, ...updates } : b));
    setEditingBill(null);
    flash("Bill updated!");
    const dbUpdates = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.dueDay !== undefined) dbUpdates.due_day = updates.dueDay;
    if (updates.dueDays !== undefined) dbUpdates.due_days = updates.dueDays;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    const { error } = await supabase.from("bills").update(dbUpdates).eq("id", id);
    if (error) { logger.error("Failed to update bill:", error); if (prev) setBills(bs => bs.map(b => b.id === id ? prev : b)); flash("Update failed."); }
  };

  return {
    transactions, setTransactions,
    budgets, setBudgets,
    financeTab, setFinanceTab,
    showNewTransaction, setShowNewTransaction,
    newTxType, setNewTxType,
    newTxCategory, setNewTxCategory,
    newTxAmount, setNewTxAmount,
    newTxDesc, setNewTxDesc,
    newTxDate, setNewTxDate,
    newTxRecurring, setNewTxRecurring,
    editingBudget, setEditingBudget,
    editBudgetVal, setEditBudgetVal,
    newIncomeCategory, setNewIncomeCategory,
    newIncomeAmount, setNewIncomeAmount,
    newIncomeDesc, setNewIncomeDesc,
    newIncomeRecurring, setNewIncomeRecurring,
    bills, setBills,
    billPayments, setBillPayments,
    newBillName, setNewBillName,
    newBillAmount, setNewBillAmount,
    newBillDueDay, setNewBillDueDay,
    newBillCategory, setNewBillCategory,
    editingTransaction, setEditingTransaction,
    editingBill, setEditingBill,
    addTransaction, deleteTransaction, updateTransaction,
    saveBudget, addIncome, togglePaid,
    addBill, deleteBill, updateBill,
    customCategories, setCustomCategories, getCategories,
    addCategory, renameCategory, deleteCategory, seedDefaultCategories,
  };
}
