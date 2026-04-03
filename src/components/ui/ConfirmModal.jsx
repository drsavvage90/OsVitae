import Modal from "./Modal";
import Btn from "./Btn";

const ConfirmModal = ({ item, onConfirm, onCancel }) => (
  <Modal open={!!item} onClose={onCancel} title={item ? `Delete ${item.title}?` : ""}>
    <p style={{ fontFamily: "var(--body)", fontSize: 14, color: "var(--muted)", margin: "0 0 20px" }}>
      This action cannot be undone.
    </p>
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
      <Btn onClick={onCancel}>Cancel</Btn>
      <Btn onClick={onConfirm} style={{ background: "#EF4444", color: "#fff", border: "none" }}>Delete</Btn>
    </div>
  </Modal>
);

export default ConfirmModal;
