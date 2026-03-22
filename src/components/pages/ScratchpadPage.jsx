import { PenTool, Eraser, Undo2, Trash2, Download } from "lucide-react";
import { Glass, Btn } from "../ui";

export default function ScratchpadPage({ canvasRef, eraserMode, setEraserMode, penColor, setPenColor, penSize, setPenSize, undoCanvas, clearCanvas, downloadCanvas, handleCanvasPointerDown, handleCanvasPointerMove, handleCanvasPointerUp }) {
  const COLORS = ["#111827","#EF4444","#F59E0B","#22C55E","#5B8DEF","#A78BFA","#EC4899","#ffffff"];
  const SIZES = [1, 2, 3, 5, 8];
  return (
    <div style={{ display:"flex",flexDirection:"column",height:"100%" }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:10 }}>
        <div>
          <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:0,fontWeight:800 }}>Scratchpad</h1>
          <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",margin:"4px 0 0" }}>Draw with Apple Pencil or touch</p>
        </div>
        <div style={{ display:"flex",gap:8,alignItems:"center",flexWrap:"wrap" }}>
          <Btn small onClick={undoCanvas}><Undo2 size={14} /></Btn>
          <Btn small onClick={clearCanvas}><Trash2 size={14} /></Btn>
          <Btn small onClick={downloadCanvas}><Download size={14} /></Btn>
        </div>
      </div>

      <Glass style={{ padding:"10px 16px",marginBottom:12,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap" }}>
        <div style={{ display:"flex",gap:4 }}>
          <div onClick={() => setEraserMode(false)} style={{
            width:40,height:40,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",
            background:!eraserMode?"var(--primary-hover-bg)":"rgba(0,0,0,0.04)",
            color:!eraserMode?"#5B8DEF":"var(--muted)",border:!eraserMode?"2px solid #5B8DEF":"2px solid transparent",
            transition:"all 0.15s",
          }}><PenTool size={18} /></div>
          <div onClick={() => setEraserMode(true)} style={{
            width:40,height:40,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",
            background:eraserMode?"var(--primary-hover-bg)":"rgba(0,0,0,0.04)",
            color:eraserMode?"#5B8DEF":"var(--muted)",border:eraserMode?"2px solid #5B8DEF":"2px solid transparent",
            transition:"all 0.15s",
          }}><Eraser size={18} /></div>
        </div>

        <div style={{ width:1,height:28,background:"rgba(0,0,0,0.08)" }} />

        <div style={{ display:"flex",gap:5,alignItems:"center" }}>
          {COLORS.map(c => (
            <div key={c} onClick={() => { setPenColor(c); setEraserMode(false); }} style={{
              width:26,height:26,borderRadius:8,background:c,cursor:"pointer",
              border: penColor === c && !eraserMode ? "2.5px solid var(--text)" : c === "#ffffff" ? "1.5px solid var(--checkbox-border)" : "2.5px solid transparent",
              transition:"all 0.15s",transform: penColor === c && !eraserMode ? "scale(1.2)" : "scale(1)",
              boxShadow: c === "#ffffff" ? "inset 0 0 0 1px rgba(0,0,0,0.06)" : "none",
            }} />
          ))}
        </div>

        <div style={{ width:1,height:28,background:"rgba(0,0,0,0.08)" }} />

        <div style={{ display:"flex",gap:5,alignItems:"center" }}>
          {SIZES.map(s => (
            <div key={s} onClick={() => setPenSize(s)} style={{
              width:32,height:32,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",
              background: penSize === s ? "var(--primary-bg)" : "var(--hover-bg)",
              border: penSize === s ? "2px solid #5B8DEF" : "2px solid transparent",
              transition:"all 0.15s",
            }}>
              <div style={{ width:Math.max(4, s*2.5),height:Math.max(4, s*2.5),borderRadius:"50%",background: penSize === s ? "#5B8DEF" : "var(--muted)" }} />
            </div>
          ))}
        </div>
      </Glass>

      <div style={{ flex:1,minHeight:0,borderRadius:16,overflow:"hidden",border:"1px solid var(--border)",background:"var(--card-bg)",position:"relative" }}>
        <canvas
          ref={canvasRef}
          width={2048}
          height={1536}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={handleCanvasPointerUp}
          onPointerCancel={handleCanvasPointerUp}
          style={{
            width:"100%",height:"100%",
            touchAction:"none",
            cursor: "crosshair",
          }}
        />
      </div>
    </div>
  );
}
