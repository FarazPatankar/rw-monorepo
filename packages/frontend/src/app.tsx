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

interface TablesResponse {
  tables?: string[];
  error?: string;
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

function Modal({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
      
      {/* Modal */}
      <div
        className="relative bg-[--color-card] border border-[--color-card-border] rounded-xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.8)] max-w-2xl w-full max-h-[80vh] overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function TablesModal({
  isOpen,
  onClose,
  tables,
  loading,
  error,
}: {
  isOpen: boolean;
  onClose: () => void;
  tables: string[];
  loading: boolean;
  error?: string;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[--color-card-border]">
        <div>
          <h3 className="font-body text-lg font-semibold tracking-tight">
            PostgreSQL Tables
          </h3>
          {!loading && !error && (
            <p className="font-mono text-[0.68rem] text-[--color-label] uppercase tracking-widest mt-1">
              {tables.length} {tables.length === 1 ? "table" : "tables"} found
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-[--color-muted] hover:text-[--color-body] transition-colors p-1"
          aria-label="Close modal"
        >
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
        </button>
      </div>

      {/* Content */}
      <div className="p-5 overflow-y-auto max-h-[calc(80vh-88px)]">
        {loading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-7 w-44" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-[#f87171] text-sm">{error}</p>
          </div>
        ) : tables.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[--color-muted] text-sm">No tables found</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tables.map((table) => (
              <span
                key={table}
                className="inline-flex items-center font-mono text-[0.75rem] font-medium px-3 py-1.5 rounded-lg bg-[#0a2540] text-[#60a5fa] border border-[#1e3a5f] hover:border-[#2563eb] transition-colors"
              >
                {table}
              </span>
            ))}
          </div>
        )}
      </div>
    </Modal>
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

function PostgresCard({ status }: { status: ServiceStatus | null }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tables, setTables] = useState<string[]>([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [tablesError, setTablesError] = useState<string | undefined>();

  const fetchTables = async () => {
    setTablesLoading(true);
    setTablesError(undefined);
    try {
      const response = await fetch("/api/postgres/tables");
      const data: TablesResponse = await response.json();
      if (data.error) {
        setTablesError(data.error);
        setTables([]);
      } else {
        setTables(data.tables || []);
      }
    } catch (e: any) {
      setTablesError(e.message || "Failed to fetch tables");
      setTables([]);
    } finally {
      setTablesLoading(false);
    }
  };

  const handleShowTables = () => {
    setIsModalOpen(true);
    fetchTables();
  };

  if (!status) return null;

  return (
    <>
      <div className="bg-[--color-card] border border-[--color-card-border] rounded-xl p-5 mb-3 transition-all duration-300 hover:border-[--color-card-border-hover] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between">
          <span className="font-body text-[0.95rem] font-semibold tracking-tight">
            PostgreSQL
          </span>
          <StatusBadge connected={status.connected} />
        </div>
        {status.connected ? (
          <>
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
            </div>
            <div className="mt-4">
              <button
                onClick={handleShowTables}
                className="inline-flex items-center gap-2 font-mono text-[0.75rem] font-medium tracking-wide px-3.5 py-2 rounded-lg border border-[--color-card-border] bg-[--color-bg] text-[--color-muted] cursor-pointer transition-all duration-200 hover:border-[#60a5fa80] hover:text-[#60a5fa] hover:shadow-[0_0_12px_-4px_rgba(96,165,250,0.3)]"
              >
                Show Tables
              </button>
            </div>
          </>
        ) : (
          <div className="mt-3">
            <span className="text-sm text-[#f87171]">{status.error}</span>
          </div>
        )}
      </div>

      <TablesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tables={tables}
        loading={tablesLoading}
        error={tablesError}
      />
    </>
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
  const [loading, setLoading] = useState(true);

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
              <PostgresCard status={status?.postgres ?? null} />
              <StatusCard name="Redis" status={status?.redis ?? null} />
            </>
          )}
        </div>

        {/* Refresh */}
        <div>
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
