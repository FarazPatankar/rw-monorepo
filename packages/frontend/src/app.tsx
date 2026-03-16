import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { formatDate } from "@rw/utils";
import "./styles.css";

function App() {
  const [time, setTime] = useState<{ date: string; timestamp: number } | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  async function fetchTime() {
    setLoading(true);
    try {
      const res = await fetch("/api/time");
      const data = await res.json();
      setTime(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>rw-monorepo</h1>
      <p>Today (client): {formatDate(new Date())}</p>

      <div className="card">
        <button onClick={fetchTime} disabled={loading}>
          {loading ? "Loading..." : "Fetch time from backend"}
        </button>
        {time && (
          <div style={{ marginTop: "1rem" }}>
            <div className="label">Date (server)</div>
            <div className="value">{time.date}</div>
            <div className="label" style={{ marginTop: "0.75rem" }}>
              Timestamp
            </div>
            <div className="value">{time.timestamp}</div>
          </div>
        )}
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
