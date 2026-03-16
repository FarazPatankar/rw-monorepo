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
          ? "bg-[#052e1f] text-[#34d399] border-[#065f46]"
          : "bg-[#2a0a0a] text-[#f87171] border-[#7f1d1d]"
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
      <span className="font-mono text-[0.68rem] font-medium uppercase tracking-widest text-[--color-label]">
        {label}
      </span>
      <span className="font-mono text-[0.82rem] text-[--color-muted]">
        {value}
      </span>
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
      className={`bg-[--color-card] border border-[--color-card-border] rounded-xl p-5 mb-3 transition-all duration-300 hover:border-[--color-card-border-hover] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)] ${className ?? ""}`}
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
          <span className="text-sm text-[#f87171]">{status.error}</span>
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
    <div className="relative z-10 min-h-screen font-body text-[--color-body] antialiased flex justify-center p-12 px-4">
      <div className="max-w-xl w-full">
        {/* Header */}
        <div className="animate-fade-up delay-1">
          <h1 className="font-display text-4xl font-bold tracking-tight mb-1">
            rw-monorepo
          </h1>
          <p className="font-mono text-xs text-[--color-label] tracking-wide mb-8">
            {formatDate(new Date())}
          </p>
        </div>

        {/* Backend */}
        <div className="animate-fade-up delay-2 mb-8">
          <h2 className="font-mono text-[0.68rem] font-medium uppercase tracking-widest text-[--color-label] mb-3">
            Backend
          </h2>
          <div className="bg-[--color-card] border border-[--color-card-border] rounded-xl p-5 transition-all duration-300 hover:border-[--color-card-border-hover] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]">
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
          <h2 className="font-mono text-[0.68rem] font-medium uppercase tracking-widest text-[--color-label] mb-3">
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
            className="inline-flex items-center gap-2 font-mono text-[0.8rem] font-medium tracking-wide px-5 py-2.5 rounded-lg border border-[--color-card-border] bg-[--color-card] text-[--color-muted] cursor-pointer transition-all duration-200 hover:border-[#2dd4bf80] hover:text-[#2dd4bf] hover:shadow-[0_0_12px_-4px_rgba(45,212,191,0.3)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[--color-card-border] disabled:hover:text-[--color-muted] disabled:hover:shadow-none"
          >
            <RefreshIcon spinning={loading} />
            {loading ? "Refreshing\u2026" : "Refresh"}
          </button>
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
