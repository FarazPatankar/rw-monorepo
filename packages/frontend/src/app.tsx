import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { formatDate } from "@rw/utils";
import "./styles.css";

interface ServiceStatus {
  connected: boolean;
  version?: string;
  serverTime?: string;
  lastPing?: string;
  error?: string;
}

interface Status {
  postgres: ServiceStatus;
  redis: ServiceStatus;
}

function StatusBadge({ connected }: { connected: boolean }) {
  return (
    <span className={`badge ${connected ? "badge-ok" : "badge-err"}`}>
      {connected ? "connected" : "disconnected"}
    </span>
  );
}

function StatusCard({
  name,
  status,
}: {
  name: string;
  status: ServiceStatus | null;
}) {
  if (!status) return null;
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">{name}</span>
        <StatusBadge connected={status.connected} />
      </div>
      {status.connected ? (
        <div className="card-body">
          {status.version && (
            <div className="row">
              <span className="label">Version</span>
              <span className="value">{status.version}</span>
            </div>
          )}
          {status.serverTime && (
            <div className="row">
              <span className="label">Server time</span>
              <span className="value">
                {new Date(status.serverTime).toLocaleString()}
              </span>
            </div>
          )}
          {status.lastPing && (
            <div className="row">
              <span className="label">Last ping</span>
              <span className="value">{status.lastPing}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="card-body">
          <span className="error">{status.error}</span>
        </div>
      )}
    </div>
  );
}

function App() {
  const [time, setTime] = useState<{ date: string; timestamp: number } | null>(
    null,
  );
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchStatus() {
    setLoading(true);
    try {
      const [timeRes, statusRes] = await Promise.all([
        fetch("/api/time"),
        fetch("/api/status"),
      ]);
      setTime(await timeRes.json());
      setStatus(await statusRes.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div>
      <h1>rw-monorepo</h1>
      <p className="subtitle">Today (client): {formatDate(new Date())}</p>

      <div className="section">
        <h2>Backend</h2>
        <div className="card">
          <div className="card-header">
            <span className="card-title">API Server</span>
            <StatusBadge connected={time !== null} />
          </div>
          {time && (
            <div className="card-body">
              <div className="row">
                <span className="label">Date (server)</span>
                <span className="value">{time.date}</span>
              </div>
              <div className="row">
                <span className="label">Timestamp</span>
                <span className="value">{time.timestamp}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="section">
        <h2>Databases</h2>
        <StatusCard name="PostgreSQL" status={status?.postgres ?? null} />
        <StatusCard name="Redis" status={status?.redis ?? null} />
      </div>

      <button onClick={fetchStatus} disabled={loading}>
        {loading ? "Refreshing..." : "Refresh"}
      </button>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
