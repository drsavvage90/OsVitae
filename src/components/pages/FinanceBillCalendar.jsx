import { useState } from "react";
import { ChevronLeft, ChevronRight, Receipt } from "lucide-react";
import { Glass } from "../ui";

export default function FinanceBillCalendar({ bills, billPayments, togglePaid, getCategories }) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const cats = getCategories();
  const allCats = [...cats.income, ...cats.expense];
  const getCat = (id) => allCats.find(c => c.id === id) || { label: id, color: "#94A3B8" };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthName = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  // Build bill map: day -> bills[]
  const billsByDay = {};
  bills.forEach(bill => {
    const dueDays = bill.dueDays || [bill.dueDay || 1];
    dueDays.forEach(d => {
      const day = Math.min(d, daysInMonth);
      if (!billsByDay[day]) billsByDay[day] = [];
      billsByDay[day].push(bill);
    });
  });

  // Total due and paid
  const totalDue = bills.reduce((s, b) => s + b.amount, 0);
  const paidAmount = bills.reduce((s, b) => {
    const dueDays = b.dueDays || [b.dueDay || 1];
    const paidCount = billPayments[`${b.id}-${monthKey}`] || 0;
    return s + (b.amount * Math.min(paidCount, dueDays.length) / dueDays.length);
  }, 0);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div>
      {/* Month Navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div onClick={prevMonth} style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--muted)", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--subtle-bg)"; e.currentTarget.style.color = "var(--text)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}
        ><ChevronLeft size={20} /></div>
        <div style={{ fontFamily: "var(--heading)", fontSize: 18, fontWeight: 800, color: "var(--text)" }}>{monthName}</div>
        <div onClick={nextMonth} style={{ width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--muted)", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--subtle-bg)"; e.currentTarget.style.color = "var(--text)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}
        ><ChevronRight size={20} /></div>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <Glass style={{ padding: 18, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Due This Month</div>
          <div style={{ fontFamily: "var(--heading)", fontSize: 24, fontWeight: 800, color: "var(--text)" }}>${totalDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
        </Glass>
        <Glass style={{ padding: 18, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Remaining</div>
          <div style={{ fontFamily: "var(--heading)", fontSize: 24, fontWeight: 800, color: (totalDue - paidAmount) > 0 ? "#EF4444" : "#22C55E" }}>
            ${(totalDue - paidAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
        </Glass>
      </div>

      {/* Calendar Grid */}
      <Glass style={{ padding: 16 }}>
        {/* Weekday headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 8 }}>
          {weekDays.map(d => (
            <div key={d} style={{ textAlign: "center", fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", fontWeight: 600, padding: "4px 0" }}>{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
          {/* Empty cells for days before the 1st */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} style={{ minHeight: 70 }} />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = isCurrentMonth && today.getDate() === day;
            const dayBills = billsByDay[day] || [];
            const isPast = isCurrentMonth && day < today.getDate();

            return (
              <div key={day} style={{
                minHeight: 70, borderRadius: 8, padding: 4, position: "relative",
                background: isToday ? "var(--subtle-bg)" : "transparent",
                border: isToday ? "2px solid var(--primary)" : "1px solid transparent",
                transition: "all 0.15s",
              }}>
                <div style={{
                  fontFamily: "var(--mono)", fontSize: 11, fontWeight: isToday ? 800 : 600,
                  color: isToday ? "var(--primary)" : isPast ? "var(--muted)" : "var(--text)",
                  marginBottom: 4, textAlign: "right", padding: "0 2px",
                }}>{day}</div>

                {dayBills.map(bill => {
                  const cat = getCat(bill.category);
                  const dueDays = bill.dueDays || [bill.dueDay || 1];
                  const paidCount = billPayments[`${bill.id}-${monthKey}`] || 0;
                  const isPaid = paidCount >= dueDays.length;

                  return (
                    <div key={bill.id} onClick={() => togglePaid(bill.id, monthKey, dueDays.length)}
                      style={{
                        fontSize: 9, fontFamily: "var(--mono)", fontWeight: 600, padding: "2px 4px",
                        borderRadius: 4, marginBottom: 2, cursor: "pointer", transition: "all 0.15s",
                        background: isPaid ? "rgba(34,197,94,0.15)" : `${cat.color}14`,
                        color: isPaid ? "#22C55E" : cat.color,
                        textDecoration: isPaid ? "line-through" : "none",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}
                      title={`${bill.name} - $${bill.amount.toFixed(2)} (${isPaid ? "Paid" : "Unpaid"})`}
                    >
                      ${bill.amount.toFixed(0)} {bill.name}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </Glass>

      {/* Upcoming bills list */}
      {isCurrentMonth && (() => {
        const upcoming = bills.filter(b => {
          const dueDays = b.dueDays || [b.dueDay || 1];
          return dueDays.some(d => d >= today.getDate());
        }).sort((a, b) => (a.dueDay || 1) - (b.dueDay || 1));

        if (upcoming.length === 0) return null;
        return (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, fontWeight: 600 }}>Upcoming This Month</div>
            {upcoming.map((bill, i) => {
              const cat = getCat(bill.category);
              const dueDays = bill.dueDays || [bill.dueDay || 1];
              const paidCount = billPayments[`${bill.id}-${monthKey}`] || 0;
              const isPaid = paidCount >= dueDays.length;
              const nextDue = dueDays.find(d => d >= today.getDate()) || dueDays[0];
              const daysUntil = nextDue - today.getDate();

              return (
                <Glass key={bill.id} style={{ padding: 14, marginBottom: 8, display: "flex", alignItems: "center", gap: 12, opacity: isPaid ? 0.5 : 1, animation: `slideUp 0.3s ${i * 0.04}s both ease-out` }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${cat.color}14`, display: "flex", alignItems: "center", justifyContent: "center", color: cat.color }}>
                    <Receipt size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "var(--heading)", fontSize: 13, fontWeight: 700, color: "var(--text)", textDecoration: isPaid ? "line-through" : "none" }}>{bill.name}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: daysUntil <= 3 && !isPaid ? "#EF4444" : "var(--muted)", fontWeight: 600 }}>
                      {isPaid ? "Paid" : daysUntil === 0 ? "Due today!" : daysUntil === 1 ? "Due tomorrow" : `Due in ${daysUntil} days`}
                    </div>
                  </div>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, color: isPaid ? "#22C55E" : "var(--text)" }}>${bill.amount.toFixed(2)}</span>
                </Glass>
              );
            })}
          </div>
        );
      })()}

      {bills.length === 0 && (
        <Glass style={{ padding: 40, textAlign: "center", marginTop: 14 }}>
          <Receipt size={32} color="var(--muted)" style={{ marginBottom: 12 }} />
          <div style={{ fontFamily: "var(--body)", fontSize: 14, color: "var(--muted)" }}>Add bills in the Bills tab to see them on the calendar</div>
        </Glass>
      )}
    </div>
  );
}
