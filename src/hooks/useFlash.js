import { useState, useCallback } from "react";

export function useFlash() {
  const [toast, setToast] = useState({ msg: "", visible: false });

  const flash = useCallback((msg) => {
    setToast({ msg, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2200);
  }, []);

  return { toast, flash };
}
