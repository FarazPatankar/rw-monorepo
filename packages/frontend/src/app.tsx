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
    <span
      className={`text-[0.7rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${
        connected
          ? "bg-green-950 text-green-400 border border-green-800"
          : "bg-red-950 text-red-400 border border-red-800"
      }`}
    >
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
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold">{name}</span>
        <StatusBadge connected={status.connected} />
      </div>
      {status.connected ? (
        <div className="mt-3 flex flex-col gap-2">
          {status.version && (
            <div className="flex justify-between items-baseline">
              <span className="text-xs uppercase tracking-wide text-neutral-500">
                Version
              </span>
              <span className="text-sm font-mono">{status.version}</span>
            </div>
          )}
          {status.serverTime && (
            <div className="flex justify-between items-baseline">
              <span className="text-xs uppercase tracking-wide text-neutral-500">
                Server time
              </span>
              <span className="text-sm font-mono">
                {new Date(status.serverTime).toLocaleString()}
              </span>
            </div>
          )}
          {status.lastPing && (
            <div className="flex justify-between items-baseline">
              <span className="text-xs uppercase tracking-wide text-neutral-500">
                Last ping
              </span>
              <span className="text-sm font-mono">{status.lastPing}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3">
          <span className="text-sm text-red-400">{status.error}</span>
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
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex justify-center p-12 px-4">
      <div className="max-w-xl w-full">
        <h1 className="text-3xl font-bold mb-1">rw-monorepo</h1>
        <p className="text-neutral-500 mb-6">
          Today (client): {formatDate(new Date())}
        </p>

        <div className="mb-6">
          <h2 className="text-sm uppercase tracking-wide text-neutral-500 mb-3">
            Backend
          </h2>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold">API Server</span>
              <StatusBadge connected={time !== null} />
            </div>
            {time && (
              <div className="mt-3 flex flex-col gap-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs uppercase tracking-wide text-neutral-500">
                    Date (server)
                  </span>
                  <span className="text-sm font-mono">{time.date}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs uppercase tracking-wide text-neutral-500">
                    Timestamp
                  </span>
                  <span className="text-sm font-mono">{time.timestamp}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-sm uppercase tracking-wide text-neutral-500 mb-3">
            Databases
          </h2>
          <StatusCard name="PostgreSQL" status={status?.postgres ?? null} />
          <StatusCard name="Redis" status={status?.redis ?? null} />
        </div>

        <button
          onClick={fetchStatus}
          disabled={loading}
          className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-sm hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
