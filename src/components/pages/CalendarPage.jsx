import { useRef, useState, useCallback, useEffect } from "react";
import { X, Pencil, GripVertical } from "lucide-react";
import { Glass, Btn } from "../ui";

const HOUR_HEIGHT = 60;
const FIRST_HOUR = 6;
const LAST_HOUR = 22;
const SNAP = 0.25; // 15-minute snap increments

function snapHour(h) {
  return Math.round(h / SNAP) * SNAP;
}

function clampHour(h, min = FIRST_HOUR, max = LAST_HOUR) {
  return Math.max(min, Math.min(max, h));
}

function formatTime(h) {
  const hr = Math.floor(h);
  const minVal = Math.round((h % 1) * 60);
  const min = minVal.toString().padStart(2, "0");
  if (hr === 0 || hr === 24) return `12:${min}`;
  if (hr > 12) return `${hr - 12}:${min}`;
  return `${hr}:${min}`;
}

export default function CalendarPage({
  timeBlocks, tasks, ws, projects, updateTimeBlock, setShowNewBlock, deleteTimeBlock, setEditingBlock, goTask
}) {
  const hours = Array.from({ length: LAST_HOUR - FIRST_HOUR }, (_, i) => i + FIRST_HOUR);
  const gridRef = useRef(null);

  // Drag state: { blockId, mode: "move"|"resize", startY, origStart, origEnd }
  const [drag, setDrag] = useState(null);
  // Preview overrides during drag: { startHour, endHour }
  const [preview, setPreview] = useState(null);

  const getHourFromY = useCallback((clientY) => {
    if (!gridRef.current) return FIRST_HOUR;
    const rect = gridRef.current.getBoundingClientRect();
    const y = clientY - rect.top + gridRef.current.scrollTop;
    return FIRST_HOUR + y / HOUR_HEIGHT;
  }, []);

  const onPointerDown = useCallback((e, block, mode) => {
    // Don't start drag on edit/delete button clicks
    if (e.target.closest("[data-action]")) return;
    e.preventDefault();
    e.stopPropagation();
    // Capture pointer for reliable tracking outside element
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({
      blockId: block.id,
      mode,
      pointerId: e.pointerId,
      startY: e.clientY,
      origStart: block.startHour,
      origEnd: block.endHour,
    });
    setPreview({ startHour: block.startHour, endHour: block.endHour });
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!drag) return;
    e.preventDefault();
    const deltaY = e.clientY - drag.startY;
    const deltaHours = deltaY / HOUR_HEIGHT;

    if (drag.mode === "move") {
      const duration = drag.origEnd - drag.origStart;
      let newStart = snapHour(drag.origStart + deltaHours);
      newStart = clampHour(newStart, FIRST_HOUR, LAST_HOUR - duration);
      setPreview({ startHour: newStart, endHour: newStart + duration });
    } else {
      // resize
      let newEnd = snapHour(drag.origEnd + deltaHours);
      newEnd = clampHour(newEnd, drag.origStart + SNAP, LAST_HOUR);
      setPreview({ startHour: drag.origStart, endHour: newEnd });
    }
  }, [drag]);

  const onPointerUp = useCallback((e) => {
    if (!drag || !preview) {
      setDrag(null);
      setPreview(null);
      return;
    }
    e.preventDefault();
    const { blockId } = drag;
    const { startHour, endHour } = preview;
    const block = timeBlocks.find(b => b.id === blockId);

    // Only update if something actually changed
    if (block && (block.startHour !== startHour || block.endHour !== endHour)) {
      updateTimeBlock(blockId, { startHour, endHour });
    }

    setDrag(null);
    setPreview(null);
  }, [drag, preview, timeBlocks, updateTimeBlock]);

  // Attach move/up listeners to window so drag works outside the grid
  useEffect(() => {
    if (!drag) return;
    const move = (e) => onPointerMove(e);
    const up = (e) => onPointerUp(e);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [drag, onPointerMove, onPointerUp]);

  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <div>
          <h1 style={{ fontFamily:"var(--heading)",fontSize:28,color:"var(--text)",margin:0,fontWeight:800 }}>Calendar</h1>
          <p style={{ fontFamily:"var(--body)",fontSize:14,color:"var(--muted)",margin:"4px 0 0" }}>
            {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})} · {timeBlocks.length} blocks
          </p>
        </div>
        <Btn primary onClick={() => setShowNewBlock(true)}>+ Add Block</Btn>
      </div>
      {timeBlocks.length === 0 && (
        <Glass style={{ padding:32,textAlign:"center",marginBottom:20 }}>
          <div style={{ fontSize:32,marginBottom:12 }}>&#x1f4c5;</div>
          <div style={{ fontFamily:"var(--heading)",fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:6 }}>No time blocks yet</div>
          <div style={{ fontFamily:"var(--body)",fontSize:13,color:"var(--muted)",marginBottom:16 }}>Plan your day by adding blocks to your calendar.</div>
          <Btn primary onClick={() => setShowNewBlock(true)}>+ Add Your First Block</Btn>
        </Glass>
      )}
      <Glass style={{ padding:0,overflow:"hidden" }}>
        <div
          ref={gridRef}
          style={{
            position:"relative",
            height:hours.length * HOUR_HEIGHT,
            touchAction: drag ? "none" : "auto",
            userSelect: drag ? "none" : "auto",
          }}
        >
          {hours.map((h, i) => (
            <div key={h} style={{ position:"absolute",top:i*HOUR_HEIGHT,left:0,right:0,height:HOUR_HEIGHT,borderBottom:"1px solid var(--subtle-bg)",display:"flex",alignItems:"flex-start" }}>
              <div style={{ width:60,padding:"8px 12px 0 0",textAlign:"right",fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",fontWeight:600,flexShrink:0 }}>
                {h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h-12} PM`}
              </div>
            </div>
          ))}
          {timeBlocks.filter(b => b.date === new Date().toISOString().split("T")[0]).map(block => {
            const isDragging = drag && drag.blockId === block.id;
            const startHour = isDragging ? preview.startHour : block.startHour;
            const endHour = isDragging ? preview.endHour : block.endHour;
            const logicalHeight = (endHour - startHour) * HOUR_HEIGHT;
            const height = Math.max(logicalHeight, 46);
            const top = (startHour - FIRST_HOUR) * HOUR_HEIGHT;
            
            const task = block.taskId ? tasks?.find(t => t.id === block.taskId) : null;
            const w = task && ws ? ws.find(x => x.id === task.wsId) : null;
            const proj = task && projects ? projects.find(p => p.id === task.projectId) : null;
            const subtitle = [w?.name, proj?.name].filter(Boolean).join(" • ");

            return (
              <div
                key={block.id}
                style={{
                  position:"absolute",
                  top: top + 2,
                  left: 68,
                  right: 12,
                  height: height - 4,
                  background: `${block.color}14`,
                  border: `1px solid ${block.color}33`,
                  borderLeft: `3px solid ${block.color}`,
                  borderRadius: 8,
                  padding: "8px 12px",
                  cursor: isDragging ? "grabbing" : "grab",
                  overflow: "hidden",
                  touchAction: "none",
                  transition: isDragging ? "none" : "top 0.15s ease, height 0.15s ease",
                  zIndex: isDragging ? 50 : 1,
                  boxShadow: isDragging ? "0 4px 20px rgba(0,0,0,0.15)" : "none",
                }}
                onPointerDown={(e) => onPointerDown(e, block, "move")}
              >
                {/* Drag handle indicator */}
                <div style={{
                  position:"absolute",top:0,left:0,right:0,height:20,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  opacity: 0.3,pointerEvents:"none",
                }}>
                  <GripVertical size={10} color="var(--muted)" />
                </div>

                <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center" }}>
                  <div style={{ fontFamily:"var(--heading)",fontSize:13,fontWeight:700,color:block.color,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" }}>
                    {block.title}
                  </div>
                  {subtitle && (
                    <div style={{ fontFamily:"var(--body)",fontSize:11,color:"var(--text)",opacity:0.8,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                      {subtitle}
                    </div>
                  )}
                  <div style={{ fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",marginTop:2 }}>
                    {formatTime(startHour)} – {formatTime(endHour)}
                  </div>
                </div>
                {block.type !== "work" && (
                  <span style={{ fontFamily:"var(--mono)",fontSize:9,color:block.color,fontWeight:600,textTransform:"uppercase" }}>
                    {block.type}
                  </span>
                )}

                {/* Action buttons */}
                <div style={{ position:"absolute",top:2,right:4,display:"flex",gap:2 }}>
                  <div
                    data-action="edit" role="button"
                    onClick={(e) => { e.stopPropagation(); setEditingBlock(block); }}
                    style={{ width:26,height:26,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--muted)",opacity:0.6,transition:"all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.color="var(--primary)"; e.currentTarget.style.opacity=1; e.currentTarget.style.background="var(--subtle-bg)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color="var(--muted)"; e.currentTarget.style.opacity=0.6; e.currentTarget.style.background="transparent"; }}
                  >
                    <Pencil size={12}/>
                  </div>
                  <div
                    data-action="delete" role="button"
                    onClick={(e) => { e.stopPropagation(); deleteTimeBlock(block.id); }}
                    style={{ width:26,height:26,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--muted)",opacity:0.6,transition:"all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.color="#EF4444"; e.currentTarget.style.opacity=1; e.currentTarget.style.background="rgba(239,68,68,0.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color="var(--muted)"; e.currentTarget.style.opacity=0.6; e.currentTarget.style.background="transparent"; }}
                  >
                    <X size={12}/>
                  </div>
                </div>

                {/* Resize handle at bottom */}
                <div
                  onPointerDown={(e) => { e.stopPropagation(); onPointerDown(e, block, "resize"); }}
                  style={{
                    position:"absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 14,
                    cursor: "ns-resize",
                    touchAction: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{
                    width: 28,
                    height: 3,
                    borderRadius: 2,
                    background: block.color,
                    opacity: 0.35,
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </Glass>
    </div>
  );
}
