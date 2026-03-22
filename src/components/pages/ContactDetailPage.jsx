import { Trash2, Mail, Phone, Clock, Users, MessageSquare, Pencil } from "lucide-react";
import { Glass, Btn } from "../ui";
import { healthColors, healthLabels } from "./ContactsPage";

export default function ContactDetailPage({ activeContact, setPage, deleteContact, setShowNewInteraction, setEditingContact }) {
  if (!activeContact) return <div>Contact not found</div>;
  const c = activeContact;
  return (
    <div style={{ maxWidth:760 }}>
      <div onClick={() => setPage("contacts")} style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--primary)",cursor:"pointer",marginBottom:16,fontWeight:600 }}>← Back to Contacts</div>
      <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom:24 }}>
        <div style={{ width:56,height:56,borderRadius:16,background:`linear-gradient(135deg, ${healthColors[c.health]}, ${healthColors[c.health]}88)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"var(--heading)",fontSize:22,fontWeight:700 }}>{c.name.split(" ").map(n => n[0]).join("")}</div>
        <div style={{ flex:1 }}>
          <h1 style={{ fontFamily:"var(--heading)",fontSize:24,color:"var(--text)",margin:0,fontWeight:800 }}>{c.name}</h1>
          <div style={{ display:"flex",alignItems:"center",gap:12,marginTop:4 }}>
            <span style={{ fontFamily:"var(--mono)",fontSize:11,color:healthColors[c.health],fontWeight:600,background:`${healthColors[c.health]}14`,padding:"2px 10px",borderRadius:8 }}>{healthLabels[c.health]}</span>
            <span style={{ fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)" }}>{c.context}</span>
          </div>
        </div>
        <div onClick={() => setEditingContact(c)} style={{ cursor:"pointer",color:"var(--muted)",padding:8 }}
          onMouseEnter={e => e.currentTarget.style.color="var(--primary)"} onMouseLeave={e => e.currentTarget.style.color="var(--muted)"}
        ><Pencil size={16}/></div>
        <div onClick={(e) => { e.stopPropagation(); if (confirm("Delete this contact?")) deleteContact(c.id); }} style={{ cursor:"pointer",color:"var(--muted)",padding:8 }}
          onMouseEnter={e => e.currentTarget.style.color="#EF4444"} onMouseLeave={e => e.currentTarget.style.color="var(--muted)"}
        ><Trash2 size={16}/></div>
      </div>

      <div className="rewards-stats" style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:20 }}>
        {c.email && <Glass style={{ padding:14,display:"flex",alignItems:"center",gap:10 }}><Mail size={16} color="var(--muted)" /><span style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--text)" }}>{c.email}</span></Glass>}
        {c.phone && <Glass style={{ padding:14,display:"flex",alignItems:"center",gap:10 }}><Phone size={16} color="var(--muted)" /><span style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--text)" }}>{c.phone}</span></Glass>}
        {c.nextFollowUp && <Glass style={{ padding:14,display:"flex",alignItems:"center",gap:10,background:"rgba(245,158,11,0.05)",border:"1px solid rgba(245,158,11,0.15)" }}><Clock size={16} color="#F59E0B" /><span style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--text)",fontWeight:600 }}>Follow up: {c.nextFollowUp}</span></Glass>}
      </div>

      {c.notes && <Glass style={{ padding:16,marginBottom:20 }}>
        <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)",lineHeight:1.7 }}>{c.notes}</div>
      </Glass>}

      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
        <h2 style={{ fontFamily:"var(--heading)",fontSize:18,color:"var(--text)",margin:0,fontWeight:700 }}>Interactions</h2>
        <Btn primary small onClick={() => setShowNewInteraction(true)}>+ Log Interaction</Btn>
      </div>
      {c.interactions.length === 0 && <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",padding:20,textAlign:"center" }}>No interactions logged yet.</div>}
      {c.interactions.map(int => (
        <Glass key={int.id} style={{ padding:14,marginBottom:8,display:"flex",alignItems:"flex-start",gap:12 }}>
          <div style={{ width:32,height:32,borderRadius:10,background:"var(--subtle-bg)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--muted)",flexShrink:0 }}>
            {int.type === "meeting" ? <Users size={16} /> : int.type === "email" ? <Mail size={16} /> : <MessageSquare size={16} />}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--text)",lineHeight:1.6 }}>{int.text}</div>
            <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",marginTop:4 }}>{int.type} · {int.date}</div>
          </div>
        </Glass>
      ))}
    </div>
  );
}
