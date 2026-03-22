import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Render error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: "center", fontFamily: "'Inter', sans-serif", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ color: "#6B7280", marginBottom: 24 }}>{this.state.error?.message}</p>
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
