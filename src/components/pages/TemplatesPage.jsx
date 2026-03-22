import { Layout, Trash2 } from "lucide-react";
import { Glass, Btn } from "../ui";

export default function TemplatesPage({ templates, setShowNewTemplate, useTemplate, deleteTemplate }) {
  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:0,fontWeight:800 }}>Templates</h1>
          <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",margin:"4px 0 0" }}>{templates.length} templates</p>
        </div>
        <Btn primary onClick={() => setShowNewTemplate(true)}>+ New Template</Btn>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
        {templates.map((tpl, i) => (
          <Glass key={tpl.id} style={{ padding:20,animation:`slideUp 0.3s ${i*0.05}s both ease-out` }}>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:"rgba(167,139,250,0.1)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--xp-color)" }}><Layout size={18} /></div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"var(--heading)",fontSize:14,fontWeight:700,color:"var(--text)" }}>{tpl.name}</div>
                <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>{tpl.category} · {tpl.items.length} items</div>
              </div>
            </div>
            {tpl.description && <div style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",marginBottom:12,lineHeight:1.5 }}>{tpl.description}</div>}
            <div style={{ marginBottom:12 }}>
              {tpl.items.slice(0, 4).map((item, j) => (
                <div key={j} style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--text)",padding:"4px 0",display:"flex",alignItems:"center",gap:8 }}>
                  <div style={{ width:16,height:16,borderRadius:5,border:"1.5px solid var(--checkbox-border)",flexShrink:0 }} />
                  {item}
                </div>
              ))}
              {tpl.items.length > 4 && <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",marginTop:4 }}>+{tpl.items.length - 4} more</div>}
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <Btn primary small color="#A78BFA" onClick={() => useTemplate(tpl)}>Use Template</Btn>
              <div onClick={() => deleteTemplate(tpl.id)} style={{ cursor:"pointer",color:"var(--muted)",padding:4 }}
                onMouseEnter={e => e.currentTarget.style.color="#EF4444"} onMouseLeave={e => e.currentTarget.style.color="var(--muted)"}
              ><Trash2 size={14}/></div>
            </div>
          </Glass>
        ))}
      </div>
    </div>
  );
}
