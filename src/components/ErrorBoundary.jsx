import { Component } from "react";
import { logger } from "../lib/logger";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logger.error("Render error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: "center", fontFamily: "'Inter', sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ color: "#6B7280", marginBottom: 24 }}>An unexpected error occurred. Please reload the app.</p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#111", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
