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
      className={`inline-flex items-center gap-1.5 font-mono text-[0.65rem] font-medium uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
        connected
          ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/60"
          : "bg-red-950/60 text-red-400 border-red-800/60"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full bg-current ${
          connected ? "animate-pulse-dot" : ""
        }`}
      />
      {connected ? "connected" : "disconnected"}
    </span>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline py-0.5">
      <span className="font-mono text-[0.68rem] font-medium uppercase tracking-widest text-zinc-600">
        {label}
      </span>
      <span className="font-mono text-[0.82rem] text-zinc-400">{value}</span>
    </div>
  );
}

function StatusCard({
  name,
  status,
  className,
}: {
  name: string;
  status: ServiceStatus | null;
  className?: string;
}) {
  if (!status) return null;
  return (
    <div
      className={`bg-zinc-900/70 border border-zinc-800/70 rounded-xl p-5 mb-3 transition-all duration-300 hover:border-zinc-700 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] ${className ?? ""}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-body text-[0.95rem] font-semibold tracking-tight">
          {name}
        </span>
        <StatusBadge connected={status.connected} />
      </div>
      {status.connected ? (
        <div className="mt-4 flex flex-col gap-1.5">
          {status.version && (
            <DataRow label="Version" value={status.version} />
          )}
          {status.serverTime && (
            <DataRow
              label="Server time"
              value={new Date(status.serverTime).toLocaleString()}
            />
          )}
          {status.lastPing && (
            <DataRow label="Last ping" value={status.lastPing} />
          )}
        </div>
      ) : (
        <div className="mt-3">
          <span className="text-sm text-red-400/90">{status.error}</span>
        </div>
      )}
    </div>
  );
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={spinning ? "animate-spin" : ""}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      <polyline points="21 3 21 9 15 9" />
    </svg>
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
    <div className="relative z-10 min-h-screen font-body text-zinc-200 antialiased flex justify-center p-12 px-4">
      <div className="max-w-xl w-full">
        {/* Header */}
        <div className="animate-fade-up delay-1">
          <h1 className="font-display text-4xl font-bold tracking-tight mb-1">
            rw-monorepo
          </h1>
          <p className="font-mono text-xs text-zinc-600 tracking-wide mb-8">
            {formatDate(new Date())}
          </p>
        </div>

        {/* Backend */}
        <div className="animate-fade-up delay-2 mb-8">
          <h2 className="font-mono text-[0.68rem] font-medium uppercase tracking-widest text-zinc-600 mb-3">
            Backend
          </h2>
          <div className="bg-zinc-900/70 border border-zinc-800/70 rounded-xl p-5 transition-all duration-300 hover:border-zinc-700 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between">
              <span className="font-body text-[0.95rem] font-semibold tracking-tight">
                API Server
              </span>
              <StatusBadge connected={time !== null} />
            </div>
            {time && (
              <div className="mt-4 flex flex-col gap-1.5">
                <DataRow label="Date (server)" value={time.date} />
                <DataRow label="Timestamp" value={String(time.timestamp)} />
              </div>
            )}
          </div>
        </div>

        {/* Databases */}
        <div className="animate-fade-up delay-3 mb-8">
          <h2 className="font-mono text-[0.68rem] font-medium uppercase tracking-widest text-zinc-600 mb-3">
            Databases
          </h2>
          <StatusCard
            name="PostgreSQL"
            status={status?.postgres ?? null}
            className="animate-fade-up delay-4"
          />
          <StatusCard
            name="Redis"
            status={status?.redis ?? null}
            className="animate-fade-up delay-5"
          />
        </div>

        {/* Refresh */}
        <div className="animate-fade-up delay-5">
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="inline-flex items-center gap-2 font-mono text-[0.8rem] font-medium tracking-wide px-5 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900/50 text-zinc-300 cursor-pointer transition-all duration-200 hover:border-teal-500/50 hover:text-teal-400 hover:shadow-[0_0_12px_-4px_rgba(94,234,212,0.3)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-zinc-800 disabled:hover:text-zinc-300 disabled:hover:shadow-none"
          >
            <RefreshIcon spinning={loading} />
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
