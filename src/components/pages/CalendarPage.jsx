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

// Compute column layout for overlapping blocks (Google Calendar style)
function computeOverlapColumns(blocks) {
  if (!blocks.length) return [];
  const sorted = blocks.map((b, i) => ({ ...b, _idx: i })).sort((a, b) => a.startHour - b.startHour || a.endHour - b.endHour);
  const columns = []; // each column is an array of blocks
  const result = new Map(); // blockId -> { col, totalCols }

  for (const block of sorted) {
    // Find first column where this block doesn't overlap
    let placed = false;
    for (let c = 0; c < columns.length; c++) {
      const last = columns[c][columns[c].length - 1];
      if (block.startHour >= last.endHour) {
        columns[c].push(block);
        result.set(block.id, { col: c });
        placed = true;
        break;
      }
    }
    if (!placed) {
      columns.push([block]);
      result.set(block.id, { col: columns.length - 1 });
    }
  }

  // For each block, find how many columns overlap at its time range
  for (const block of sorted) {
    let maxCols = 1;
    for (const other of sorted) {
      if (other.id === block.id) continue;
      if (other.startHour < block.endHour && other.endHour > block.startHour) {
        const otherCol = result.get(other.id).col;
        const thisCol = result.get(block.id).col;
        maxCols = Math.max(maxCols, Math.max(otherCol, thisCol) + 1);
      }
    }
    result.get(block.id).totalCols = maxCols;
  }

  return result;
}

export default function CalendarPage({
  timeBlocks, tasks, ws, projects, updateTimeBlock, setShowNewBlock, deleteTimeBlock, setEditingBlock, goTask
}) {
  const hours = Array.from({ length: LAST_HOUR - FIRST_HOUR }, (_, i) => i + FIRST_HOUR);
  const gridRef = useRef(null);

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
          }}
        >
          {hours.map((h, i) => (
            <div key={h} style={{ position:"absolute",top:i*HOUR_HEIGHT,left:0,right:0,height:HOUR_HEIGHT,borderBottom:"1px solid var(--subtle-bg)",display:"flex",alignItems:"flex-start" }}>
              <div style={{ width:60,padding:"8px 12px 0 0",textAlign:"right",fontFamily:"var(--mono)",fontSize:10,color:"var(--muted)",fontWeight:600,flexShrink:0 }}>
                {h === 0 ? "12 AM" : h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h-12} PM`}
              </div>
            </div>
          ))}
          {(() => {
            const todayBlocks = timeBlocks.filter(b => b.date === new Date().toISOString().split("T")[0]);
            const layout = computeOverlapColumns(todayBlocks);
            return todayBlocks.map(block => {
            const startHour = block.startHour;
            const endHour = block.endHour;
            const logicalHeight = (endHour - startHour) * HOUR_HEIGHT;
            const height = Math.max(logicalHeight, 46);
            const top = (startHour - FIRST_HOUR) * HOUR_HEIGHT;

            const task = block.taskId ? tasks?.find(t => t.id === block.taskId) : null;
            const w = task && ws ? ws.find(x => x.id === task.wsId) : null;
            const proj = task && projects ? projects.find(p => p.id === task.projectId) : null;
            const subtitle = [w?.name, proj?.name].filter(Boolean).join(" • ");

            const { col = 0, totalCols = 1 } = layout.get(block.id) || {};
            const LABEL_WIDTH = 68;
            const RIGHT_PAD = 12;
            const availWidth = `calc(100% - ${LABEL_WIDTH + RIGHT_PAD}px)`;
            const colWidth = `calc(${availWidth} / ${totalCols})`;
            const leftOffset = `calc(${LABEL_WIDTH}px + ${availWidth} * ${col} / ${totalCols})`;

            return (
              <div
                key={block.id}
                style={{
                  position:"absolute",
                  top: top + 2,
                  left: leftOffset,
                  width: `calc(${colWidth} - 4px)`,
                  height: height - 4,
                  background: `${block.color}14`,
                  border: `1px solid ${block.color}33`,
                  borderLeft: `3px solid ${block.color}`,
                  borderRadius: 8,
                  padding: "8px 12px",
                  overflow: "hidden",
                  zIndex: 1,
                }}
              >

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
          });
          })()}
        </div>
      </Glass>
    </div>
  );
}
