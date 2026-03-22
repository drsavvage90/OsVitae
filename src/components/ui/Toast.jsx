const Toast = ({ message, visible }) => (
  <div className="toast-container" style={{
    position:"fixed",bottom:"calc(24px + env(safe-area-inset-bottom, 0px))",left:"50%",transform:`translateX(-50%) translateY(${visible ? 0 : 20}px)`,
    opacity:visible?1:0,transition:"all 0.3s ease",zIndex:200,
    background:"var(--toast-bg)",backdropFilter:"blur(24px)",WebkitBackdropFilter:"blur(24px)",color:"var(--text-on-primary)",
    padding:"10px 24px",borderRadius:14,fontFamily:"var(--body)",fontSize:13,fontWeight:600,
    boxShadow:"var(--toast-shadow)",pointerEvents:"none",maxWidth:"calc(100vw - 32px)",textAlign:"center",
  }}>{message}</div>
);

export default Toast;
