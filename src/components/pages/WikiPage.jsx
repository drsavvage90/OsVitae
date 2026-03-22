import { Library, ChevronRight } from "lucide-react";
import { Glass, Btn } from "../ui";

export default function WikiPage({ wiki, setShowNewWiki, goWiki }) {
  const categories = [...new Set(wiki.map(a => a.category))];
  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:0,fontWeight:800 }}>Knowledge Base</h1>
          <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",margin:"4px 0 0" }}>{wiki.length} articles</p>
        </div>
        <Btn primary onClick={() => setShowNewWiki(true)}>+ New Article</Btn>
      </div>
      {wiki.length === 0 && (
        <Glass style={{ padding:32,textAlign:"center" }}>
          <div style={{ fontSize:32,marginBottom:12 }}>&#x1f4da;</div>
          <div style={{ fontFamily:"var(--heading)",fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:6 }}>No articles yet</div>
          <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",marginBottom:16 }}>Start building your personal knowledge base.</div>
          <Btn primary onClick={() => setShowNewWiki(true)}>+ Write Your First Article</Btn>
        </Glass>
      )}
      {categories.map(cat => (
        <div key={cat} style={{ marginBottom:20 }}>
          <div style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:2,marginBottom:10,fontWeight:600 }}>{cat}</div>
          {wiki.filter(a => a.category === cat).map((article, i) => (
            <Glass key={article.id} hover onClick={() => goWiki(article.id)} style={{ padding:16,marginBottom:8,cursor:"pointer",display:"flex",alignItems:"center",gap:14,animation:`slideUp 0.3s ${i*0.05}s both ease-out` }}>
              <div style={{ width:36,height:36,borderRadius:10,background:"var(--primary-bg)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--primary)" }}><Library size={18} /></div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"var(--heading)",fontSize:14,fontWeight:700,color:"var(--text)" }}>{article.title}</div>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:4 }}>
                  {article.tags.map(tag => <span key={tag} style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",background:"var(--subtle-bg)",padding:"2px 8px",borderRadius:6 }}>{tag}</span>)}
                  <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>Updated {article.lastUpdated}</span>
                </div>
              </div>
              <ChevronRight size={16} color="var(--muted)" />
            </Glass>
          ))}
        </div>
      ))}
    </div>
  );
}
