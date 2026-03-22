import { Bookmark, Link, Trash2, Pencil } from "lucide-react";
import { Glass, Btn } from "../ui";

export default function BookmarksPage({ bookmarks, ws, setShowNewBookmark, deleteBookmark, setEditingBookmark }) {
  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:0,fontWeight:800 }}>Bookmarks</h1>
          <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",margin:"4px 0 0" }}>{bookmarks.length} saved</p>
        </div>
        <Btn primary onClick={() => setShowNewBookmark(true)}>+ Save Bookmark</Btn>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
        {bookmarks.map((bk, i) => {
          const bkWs = ws.find(w => w.id === bk.wsId);
          return (
            <Glass key={bk.id} hover style={{ padding:18,animation:`slideUp 0.3s ${i*0.05}s both ease-out` }}>
              <div style={{ display:"flex",alignItems:"flex-start",gap:12 }}>
                <div style={{ width:36,height:36,borderRadius:10,background:"var(--primary-bg)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--primary)",flexShrink:0 }}><Bookmark size={18} /></div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontFamily:"var(--heading)",fontSize:14,fontWeight:700,color:"var(--text)",marginBottom:4 }}>{bk.title}</div>
                  {bk.description && <div style={{ fontFamily:"var(--body)",fontSize:12,color:"var(--muted)",lineHeight:1.5,marginBottom:6 }}>{bk.description}</div>}
                  <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--primary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}><Link size={10} style={{ display:"inline",verticalAlign:"middle",marginRight:4 }} />{bk.url}</div>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:8 }}>
                    {bk.tags.map(tag => <span key={tag} style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",background:"var(--subtle-bg)",padding:"2px 8px",borderRadius:6 }}>{tag}</span>)}
                    {bkWs && <span style={{ fontFamily:"var(--mono)",fontSize:9,color:bkWs.color,fontWeight:600 }}>{bkWs.name}</span>}
                    <span style={{ fontFamily:"var(--mono)",fontSize:9,color:"var(--muted)",marginLeft:"auto" }}>{bk.createdAt}</span>
                  </div>
                </div>
                <div style={{ display:"flex",flexDirection:"column",gap:6,flexShrink:0 }}>
                  <div onClick={() => setEditingBookmark(bk)} style={{ cursor:"pointer",color:"var(--muted)",padding:4 }}
                    onMouseEnter={e => e.currentTarget.style.color="var(--primary)"} onMouseLeave={e => e.currentTarget.style.color="var(--muted)"}
                  ><Pencil size={14}/></div>
                  <div onClick={() => deleteBookmark(bk.id)} style={{ cursor:"pointer",color:"var(--muted)",padding:4 }}
                    onMouseEnter={e => e.currentTarget.style.color="#EF4444"} onMouseLeave={e => e.currentTarget.style.color="var(--muted)"}
                  ><Trash2 size={14}/></div>
                </div>
              </div>
            </Glass>
          );
        })}
      </div>
    </div>
  );
}
