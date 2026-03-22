import { useState } from "react";
import { Send, X, Check, Pencil, CheckSquare, Square } from "lucide-react";
import { Glass, Btn } from "../ui";
import { getUserId } from "../../lib/getUserId";
import { supabase } from "../../lib/supabase";
import { logger } from "../../lib/logger";

export default function InboxPage({ inbox, newInboxText, setNewInboxText, addInboxItem, triageInbox, dismissInbox, updateInboxItem, setTasks, flash, inputStyle }) {
  const untriaged = inbox.filter(i => !i.triaged);
  const triaged = inbox.filter(i => i.triaged);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [selected, setSelected] = useState(new Set());

  const toggleSelect = (id) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const startEdit = (item) => {
    setEditId(item.id);
    setEditText(item.text);
  };

  const saveEdit = () => {
    if (editText.trim() && editId) {
      updateInboxItem(editId, editText.trim());
    }
    setEditId(null);
    setEditText("");
  };

  const convertToTask = async (item) => {
    const id = crypto.randomUUID();
    setTasks(ts => [...ts, { id, title: item.text, desc: "From inbox", priority: "medium", wsId: null, dueTime: null, dueDate: null, done: false, section: "afternoon", subtasks: [], notes: [], attachments: [], totalPomos: 1, donePomos: 0, reward: null }]);
    const userId = await getUserId();
    if (userId) {
      const { error } = await supabase.from("tasks").insert({ id, user_id: userId, title: item.text, description: "From inbox", priority: "medium", done: false, section: "afternoon" });
      if (error) logger.error("Failed to save task from inbox:", error);
    }
    triageInbox(item.id);
    flash("Converted to task!");
  };

  const batchTriageSelected = () => {
    selected.forEach(id => triageInbox(id));
    setSelected(new Set());
    flash(`Triaged ${selected.size} item${selected.size > 1 ? "s" : ""}!`);
  };

  const batchConvertSelected = async () => {
    const items = untriaged.filter(i => selected.has(i.id));
    for (const item of items) await convertToTask(item);
    setSelected(new Set());
  };

  return (
    <div>
      <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:"0 0 4px",fontWeight:800 }}>Inbox</h1>
      <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",margin:"0 0 20px" }}>Quick capture — dump it here, triage it later.</p>

      <Glass style={{ padding:16,marginBottom:24,display:"flex",gap:10 }}>
        <input value={newInboxText} onChange={e => setNewInboxText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addInboxItem()}
          placeholder="What's on your mind? Press Enter to capture..."
          style={{ ...inputStyle, flex:1 }} />
        <Btn primary onClick={addInboxItem}><Send size={14} /></Btn>
      </Glass>

      {untriaged.length > 0 && (
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
            <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:2,fontWeight:600 }}>Pending ({untriaged.length})</div>
            {selected.size > 0 && (
              <div style={{ display:"flex",gap:6,alignItems:"center" }}>
                <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--primary)",fontWeight:600 }}>{selected.size} selected</span>
                <Btn small primary onClick={batchConvertSelected}>All → Tasks</Btn>
                <Btn small onClick={batchTriageSelected}>Done All</Btn>
              </div>
            )}
          </div>
          {untriaged.map((item, i) => (
            <Glass key={item.id} style={{ padding:14,marginBottom:8,display:"flex",alignItems:"center",gap:12,animation:`slideUp 0.3s ${i*0.04}s both ease-out` }}>
              <div role="button" onClick={() => toggleSelect(item.id)} style={{ width:28,height:28,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:selected.has(item.id) ? "var(--primary)" : "var(--muted)",flexShrink:0,transition:"all 0.15s" }}>
                {selected.has(item.id) ? <CheckSquare size={16} /> : <Square size={16} />}
              </div>
              <div style={{ flex:1 }}>
                {editId === item.id ? (
                  <input value={editText} onChange={e => setEditText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") { setEditId(null); setEditText(""); } }}
                    onBlur={saveEdit} autoFocus
                    style={{ ...inputStyle, width:"100%" }} />
                ) : (
                  <>
                    <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)" }}>{item.text}</div>
                    <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",marginTop:4 }}>{item.createdAt}</div>
                  </>
                )}
              </div>
              {editId !== item.id && (
                <div style={{ display:"flex",gap:4,alignItems:"center" }}>
                  <div role="button" onClick={() => startEdit(item)} style={{ width:28,height:28,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--muted)",transition:"all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.color="var(--primary)"; e.currentTarget.style.background="var(--subtle-bg)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color="var(--muted)"; e.currentTarget.style.background="transparent"; }}
                  ><Pencil size={14}/></div>
                  <Btn small onClick={() => convertToTask(item)}>→ Task</Btn>
                  <Btn small onClick={() => triageInbox(item.id)}>Done</Btn>
                  <div role="button" onClick={() => dismissInbox(item.id)} style={{ width:28,height:28,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--muted)",transition:"all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.color="#EF4444"; e.currentTarget.style.background="rgba(239,68,68,0.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color="var(--muted)"; e.currentTarget.style.background="transparent"; }}
                  ><X size={14} /></div>
                </div>
              )}
            </Glass>
          ))}
        </div>
      )}

      {untriaged.length === 0 && triaged.length === 0 && (
        <Glass style={{ padding:32,textAlign:"center" }}>
          <div style={{ fontSize:32,marginBottom:12 }}>&#x1f4ed;</div>
          <div style={{ fontFamily:"var(--heading)",fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:6 }}>Inbox zero</div>
          <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)" }}>Capture thoughts above — triage them when you're ready.</div>
        </Glass>
      )}

      {triaged.length > 0 && (
        <div>
          <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:2,marginBottom:10,fontWeight:600 }}>Triaged ({triaged.length})</div>
          {triaged.map(item => (
            <div key={item.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 16px",marginBottom:4,opacity:0.5 }}>
              <Check size={14} color="#22C55E" />
              <span style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",textDecoration:"line-through" }}>{item.text}</span>
              <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",marginLeft:"auto" }}>{item.createdAt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
