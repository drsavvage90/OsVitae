import { Pencil, Trash2 } from "lucide-react";
import { Glass, Btn } from "../ui";

export default function WikiArticlePage({ activeWiki, setPage, editingWiki, setEditingWiki, editWikiContent, setEditWikiContent, saveWikiEdit, deleteWikiArticle, inputStyle }) {
  if (!activeWiki) return <div>Article not found</div>;
  return (
    <div style={{ maxWidth:760 }}>
      <div onClick={() => setPage("wiki")} style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--primary)",cursor:"pointer",marginBottom:16,fontWeight:600 }}>← Back to Wiki</div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:"var(--heading)",fontSize:26,color:"var(--text)",margin:0,fontWeight:800,letterSpacing:-0.5 }}>{activeWiki.title}</h1>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:6 }}>
            <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--primary)",fontWeight:600,background:"var(--primary-bg)",padding:"2px 10px",borderRadius:6 }}>{activeWiki.category}</span>
            {activeWiki.tags.map(tag => <span key={tag} style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",background:"var(--subtle-bg)",padding:"2px 8px",borderRadius:6 }}>{tag}</span>)}
            <span style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)" }}>Updated {activeWiki.lastUpdated}</span>
          </div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <Btn small onClick={() => { if (editingWiki) { saveWikiEdit(); } else { setEditWikiContent(activeWiki.content); setEditingWiki(true); } }}>
            {editingWiki ? "Save" : <><Pencil size={12} style={{ marginRight:4 }} />Edit</>}
          </Btn>
          <div onClick={() => { if (confirm("Delete this article?")) deleteWikiArticle(activeWiki.id); }} style={{ cursor:"pointer",color:"var(--muted)",padding:4 }}
            onMouseEnter={e => e.currentTarget.style.color="#EF4444"} onMouseLeave={e => e.currentTarget.style.color="var(--muted)"}
          ><Trash2 size={16}/></div>
        </div>
      </div>
      {editingWiki ? (
        <textarea value={editWikiContent} onChange={e => setEditWikiContent(e.target.value)} style={{ ...inputStyle, minHeight:400,resize:"vertical",fontFamily:"var(--mono)",fontSize:13,lineHeight:1.8 }} />
      ) : (
        <Glass style={{ padding:24 }}>
          <div style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--text)",lineHeight:1.8,whiteSpace:"pre-wrap" }}>{activeWiki.content}</div>
        </Glass>
      )}
    </div>
  );
}
