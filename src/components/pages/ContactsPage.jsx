import { Glass, Btn } from "../ui";

const healthColors = { strong: "#22C55E", "needs-attention": "#F59E0B", fading: "#EF4444" };
const healthLabels = { strong: "Strong", "needs-attention": "Needs attention", fading: "Fading" };

export default function ContactsPage({ contacts, setShowNewContact, goContact }) {
  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:0,fontWeight:800 }}>Contacts</h1>
          <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",margin:"4px 0 0" }}>{contacts.length} people · {contacts.filter(c => c.health === "fading").length} need attention</p>
        </div>
        <Btn primary onClick={() => setShowNewContact(true)}>+ Add Contact</Btn>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
        {contacts.map((c, i) => (
          <Glass key={c.id} hover onClick={() => goContact(c.id)} style={{ padding:18,cursor:"pointer",animation:`slideUp 0.3s ${i*0.05}s both ease-out` }}>
            <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:10 }}>
              <div style={{ width:40,height:40,borderRadius:12,background:`linear-gradient(135deg, ${healthColors[c.health]}, ${healthColors[c.health]}88)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"var(--heading)",fontSize:16,fontWeight:700 }}>{c.name.split(" ").map(n => n[0]).join("")}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"var(--heading)",fontSize:14,fontWeight:700,color:"var(--text)" }}>{c.name}</div>
                <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{c.context}</div>
              </div>
              <div style={{ width:8,height:8,borderRadius:"50%",background:healthColors[c.health] }} title={healthLabels[c.health]} />
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" }}>
              {c.tags.map(tag => <span key={tag} style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",background:"var(--subtle-bg)",padding:"2px 8px",borderRadius:6 }}>{tag}</span>)}
            </div>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10,fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>
              <span>Last: {c.lastContact}</span>
              {c.nextFollowUp && <span style={{ color:"#F59E0B",fontWeight:600 }}>Follow up: {c.nextFollowUp}</span>}
            </div>
          </Glass>
        ))}
      </div>
    </div>
  );
}

export { healthColors, healthLabels };
