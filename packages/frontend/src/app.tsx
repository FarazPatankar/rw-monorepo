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

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-skeleton rounded bg-[--color-card-border] ${className ?? ""}`}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="bg-[--color-card] border border-[--color-card-border] rounded-xl p-5 mb-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-[0.95rem] w-24" />
        <Skeleton className="h-[1.15rem] w-[5.5rem] rounded-full" />
      </div>
      <div className="mt-4 flex flex-col gap-1.5">
        <div className="flex justify-between items-baseline py-0.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-28" />
        </div>
        <div className="flex justify-between items-baseline py-0.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>
    </div>
  );
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
}: {
  name: string;
  status: ServiceStatus | null;
}) {
  if (!status) return null;
  return (
    <div className="bg-[--color-card] border border-[--color-card-border] rounded-xl p-5 mb-3 transition-all duration-300 hover:border-[--color-card-border-hover] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]">
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

function RailwayIcon() {
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
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
      <path d="M15 3v18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function Modal({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      {/* Modal content */}
      <div
        className="relative z-10 w-full max-w-2xl max-h-[80vh] bg-[--color-card] border border-[--color-card-border] rounded-xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function RailwayVariablesModal({
  isOpen,
  onClose,
  variables,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  variables: Record<string, string> | null;
  loading: boolean;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[--color-card-border]">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Railway Variables
          </h2>
          <p className="font-mono text-xs text-[--color-label] tracking-wide mt-1">
            Environment variables prefixed with RAILWAY_*
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg border border-[--color-card-border] bg-[--color-bg] text-[--color-muted] cursor-pointer transition-all duration-200 hover:border-[--color-card-border-hover] hover:text-[--color-body]"
          aria-label="Close modal"
        >
          <CloseIcon />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2 p-4 bg-[--color-bg] border border-[--color-card-border] rounded-lg">
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : variables && Object.keys(variables).length > 0 ? (
          <div className="flex flex-col gap-3">
            {Object.entries(variables).map(([key, value]) => (
              <div
                key={key}
                className="p-4 bg-[--color-bg] border border-[--color-card-border] rounded-lg transition-all duration-200 hover:border-[--color-card-border-hover]"
              >
                <div className="font-mono text-[0.75rem] font-medium uppercase tracking-widest text-[--color-label] mb-2">
                  {key}
                </div>
                <div className="font-mono text-[0.85rem] text-[--color-body] break-all">
                  {value || <span className="text-[--color-muted] italic">empty</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="font-mono text-sm text-[--color-muted]">
              No Railway environment variables found
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}

function App() {
  const [time, setTime] = useState<{ date: string; timestamp: number } | null>(
    null,
  );
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [railwayVariables, setRailwayVariables] = useState<Record<string, string> | null>(null);
  const [railwayModalOpen, setRailwayModalOpen] = useState(false);
  const [railwayLoading, setRailwayLoading] = useState(false);

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

  async function fetchRailwayVariables() {
    setRailwayLoading(true);
    setRailwayModalOpen(true);
    try {
      const res = await fetch("/api/railway-variables");
      const data = await res.json();
      setRailwayVariables(data);
    } catch (error) {
      console.error("Failed to fetch Railway variables:", error);
      setRailwayVariables({});
    } finally {
      setRailwayLoading(false);
    }
  }

  useEffect(() => {
    fetchStatus();
  }, []);

  const loaded = time !== null && status !== null;

  return (
    <div className="relative z-10 min-h-screen font-body text-[--color-body] antialiased flex justify-center p-12 px-4">
      <div className="max-w-xl w-full">
        {/* Header */}
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight mb-1">
            rw-monorepo
          </h1>
          <p className="font-mono text-xs text-[--color-label] tracking-wide mb-8">
            {formatDate(new Date())}
          </p>
        </div>

        {/* Backend */}
        <div className="mb-8">
          <h2 className="font-mono text-[0.68rem] font-medium uppercase tracking-widest text-[--color-label] mb-3">
            Backend
          </h2>
          {!loaded ? (
            <SkeletonCard />
          ) : (
            <div className="animate-fade-in bg-[--color-card] border border-[--color-card-border] rounded-xl p-5 transition-all duration-300 hover:border-[--color-card-border-hover] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between">
                <span className="font-body text-[0.95rem] font-semibold tracking-tight">
                  API Server
                </span>
                <StatusBadge connected={time !== null} />
              </div>
              {time && (
                <div className="mt-4 flex flex-col gap-1.5">
                  <DataRow label="Date (server)" value={time.date} />
                  <DataRow label="Timestamp" value={new Date(time.timestamp).toLocaleString()} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Databases */}
        <div className="mb-8">
          <h2 className="font-mono text-[0.68rem] font-medium uppercase tracking-widest text-[--color-label] mb-3">
            Databases
          </h2>
          {!loaded ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <StatusCard name="PostgreSQL" status={status?.postgres ?? null} />
              <StatusCard name="Redis" status={status?.redis ?? null} />
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="inline-flex items-center gap-2 font-mono text-[0.8rem] font-medium tracking-wide px-5 py-2.5 rounded-lg border border-[--color-card-border] bg-[--color-card] text-[--color-muted] cursor-pointer transition-all duration-200 hover:border-[#2dd4bf80] hover:text-[#2dd4bf] hover:shadow-[0_0_12px_-4px_rgba(45,212,191,0.3)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[--color-card-border] disabled:hover:text-[--color-muted] disabled:hover:shadow-none"
          >
            <RefreshIcon spinning={loading} />
            {loading ? "Refreshing\u2026" : "Refresh"}
          </button>
          
          <button
            onClick={fetchRailwayVariables}
            className="inline-flex items-center gap-2 font-mono text-[0.8rem] font-medium tracking-wide px-5 py-2.5 rounded-lg border border-[--color-card-border] bg-[--color-card] text-[--color-muted] cursor-pointer transition-all duration-200 hover:border-[#a78bfa80] hover:text-[#a78bfa] hover:shadow-[0_0_12px_-4px_rgba(167,139,250,0.3)]"
          >
            <RailwayIcon />
            Railway Variables
          </button>
        </div>
      </div>

      {/* Railway Variables Modal */}
      <RailwayVariablesModal
        isOpen={railwayModalOpen}
        onClose={() => setRailwayModalOpen(false)}
        variables={railwayVariables}
        loading={railwayLoading}
      />
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
