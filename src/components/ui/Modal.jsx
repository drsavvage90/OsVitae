import { X } from "lucide-react";

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div style={{ position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:"env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)" }}
      onClick={onClose}>
      <div style={{ position:"absolute",inset:0,background:"var(--overlay)",backdropFilter:"blur(16px)",WebkitBackdropFilter:"blur(16px)" }} />
      <div className="modal-inner" onClick={e => e.stopPropagation()} style={{
        position:"relative",width:520,maxHeight:"80dvh",overflow:"auto",
        background:"var(--card-bg)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",
        borderRadius:20,border:"1px solid var(--card-border)",
        boxShadow:"var(--modal-shadow)",padding:28,
        animation:"scaleIn 0.2s ease",
        WebkitOverflowScrolling:"touch",
      }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
          <h3 style={{ fontFamily:"var(--heading)",fontSize:18,fontWeight:700,color:"var(--text)",margin:0 }}>{title}</h3>
          <div onClick={onClose} style={{ width:32,height:32,borderRadius:8,background:"var(--subtle-bg)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:14,color:"var(--muted)" }}><X size={16} /></div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
