import { X, Pencil } from "lucide-react";
import { Glass, Btn } from "../ui";

export default function CalendarPage({ timeBlocks, setShowNewBlock, deleteTimeBlock, setEditingBlock, goTask }) {
  const hours = Array.from({ length: 16 }, (_, i) => i + 6);
  const hourHeight = 60;
  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:0,fontWeight:800 }}>Calendar</h1>
          <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",margin:"4px 0 0" }}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})} · {timeBlocks.length} blocks</p>
        </div>
        <Btn primary onClick={() => setShowNewBlock(true)}>+ Add Block</Btn>
      </div>
      <Glass style={{ padding:0,overflow:"hidden" }}>
        <div style={{ position:"relative",height:hours.length*hourHeight }}>
          {hours.map((h, i) => (
            <div key={h} style={{ position:"absolute",top:i*hourHeight,left:0,right:0,height:hourHeight,borderBottom:"1px solid var(--subtle-bg)",display:"flex",alignItems:"flex-start" }}>
              <div style={{ width:60,padding:"8px 12px 0 0",textAlign:"right",fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",fontWeight:600,flexShrink:0 }}>
                {h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h-12} PM`}
              </div>
            </div>
          ))}
          {timeBlocks.map(block => {
            const top = (block.startHour - 6) * hourHeight;
            const height = (block.endHour - block.startHour) * hourHeight;
            return (
              <div key={block.id} style={{
                position:"absolute",top:top+2,left:68,right:12,height:height-4,
                background:`${block.color}14`,border:`1px solid ${block.color}33`,borderLeft:`3px solid ${block.color}`,
                borderRadius:8,padding:"8px 12px",cursor:"pointer",overflow:"hidden",
              }} onClick={() => block.taskId && goTask(block.taskId)}>
                <div style={{ fontFamily:"var(--heading)",fontSize:13,fontWeight:700,color:block.color }}>{block.title}</div>
                <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",marginTop:2 }}>
                  {Math.floor(block.startHour) > 12 ? `${Math.floor(block.startHour)-12}` : Math.floor(block.startHour)}:{block.startHour % 1 ? "30" : "00"} – {Math.floor(block.endHour) > 12 ? `${Math.floor(block.endHour)-12}` : Math.floor(block.endHour)}:{block.endHour % 1 ? "30" : "00"}
                </div>
                {block.type !== "work" && <span style={{ fontFamily:"var(--mono)",fontSize:9,color:block.color,fontWeight:600,textTransform:"uppercase" }}>{block.type}</span>}
                <div style={{ position:"absolute",top:4,right:24,display:"flex",gap:4 }}>
                  <div onClick={(e) => { e.stopPropagation(); setEditingBlock(block); }} style={{ cursor:"pointer",color:"var(--muted)",opacity:0.5 }}
                    onMouseEnter={e => { e.currentTarget.style.color="var(--primary)"; e.currentTarget.style.opacity=1; }} onMouseLeave={e => { e.currentTarget.style.color="var(--muted)"; e.currentTarget.style.opacity=0.5; }}
                  ><Pencil size={12}/></div>
                </div>
                <div onClick={(e) => { e.stopPropagation(); deleteTimeBlock(block.id); }} style={{ position:"absolute",top:4,right:6,cursor:"pointer",color:"var(--muted)",opacity:0.5 }}
                  onMouseEnter={e => { e.currentTarget.style.color="#EF4444"; e.currentTarget.style.opacity=1; }} onMouseLeave={e => { e.currentTarget.style.color="var(--muted)"; e.currentTarget.style.opacity=0.5; }}
                ><X size={12}/></div>
              </div>
            );
          })}
        </div>
      </Glass>
    </div>
  );
}
