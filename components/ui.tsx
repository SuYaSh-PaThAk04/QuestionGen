"use client";
import React from "react";

/* ── Badge ─────────────────────────────────────────────── */
const CO_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  CO1: { bg: "rgba(76,201,240,0.10)", text: "#4CC9F0", border: "rgba(76,201,240,0.25)" },
  CO2: { bg: "rgba(74,222,128,0.10)", text: "#4ADE80", border: "rgba(74,222,128,0.25)" },
  CO3: { bg: "rgba(232,197,71,0.12)", text: "#E8C547", border: "rgba(232,197,71,0.28)" },
};

export function COBadge({ co }: { co: string }) {
  const s = CO_STYLES[co] ?? CO_STYLES.CO1;
  return (
    <span
      className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      {co}
    </span>
  );
}

/* ── Step indicator ─────────────────────────────────────── */
export function StepIndicator({ current }: { current: number }) {
  const steps = ["Upload", "Validate", "Paper"];
  return (
    <div className="flex items-center gap-1">
      {steps.map((label, i) => {
        const idx = i + 1;
        const isActive = idx === current;
        const isDone = idx < current;
        return (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300"
                style={{
                  background: isDone ? "var(--jade)" : isActive ? "var(--gold)" : "var(--bg-elevated)",
                  color: isDone || isActive ? "#0D1117" : "var(--text-muted)",
                  border: !isDone && !isActive ? "1px solid var(--border-subtle)" : "none",
                }}
              >
                {isDone ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4 7L8 3" stroke="#0D1117" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  idx
                )}
              </div>
              <span
                className="text-xs font-medium hidden sm:block"
                style={{ color: isActive ? "var(--text-primary)" : "var(--text-muted)" }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-8 h-px mx-1" style={{ background: isDone ? "var(--jade-dim)" : "var(--border-subtle)" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ── Stat card ──────────────────────────────────────────── */
export function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-1"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}
    >
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
      <span className="text-2xl font-display font-semibold" style={{ color: accent ?? "var(--text-primary)" }}>
        {value}
      </span>
    </div>
  );
}

/* ── Button ─────────────────────────────────────────────── */
type BtnVariant = "primary" | "secondary" | "ghost" | "danger";
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  icon?: React.ReactNode;
}
const BTN_STYLES: Record<BtnVariant, string> = {
  primary: "text-obsidian-900 font-medium",
  secondary: "font-medium",
  ghost: "",
  danger: "font-medium",
};

export function Btn({ variant = "secondary", icon, children, className = "", style, ...rest }: BtnProps) {
  const base: React.CSSProperties =
    variant === "primary"
      ? { background: "var(--gold)", color: "#080A0C", border: "none" }
      : variant === "danger"
      ? { background: "var(--rose-dim)", color: "var(--rose)", border: "1px solid rgba(251,113,133,0.25)" }
      : { background: "var(--bg-elevated)", color: "var(--text-primary)", border: "1px solid var(--border-medium)" };

  return (
    <button
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-150 hover:opacity-80 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${BTN_STYLES[variant]} ${className}`}
      style={{ ...base, ...style }}
      {...rest}
    >
      {icon && <span className="w-4 h-4 flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

/* ── Section header rule ─────────────────────────────────── */
export function SectionRule({ label, index }: { label: string; index: number }) {
  const colors = ["var(--electric)", "var(--gold)", "var(--jade)"];
  return (
    <div className="flex items-center gap-3 mb-5">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold flex-shrink-0"
        style={{ background: `${colors[index]}22`, color: colors[index], border: `1px solid ${colors[index]}44` }}
      >
        {String.fromCharCode(65 + index)}
      </div>
      <span className="font-display font-medium text-base" style={{ color: "var(--text-primary)" }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>5 questions</span>
    </div>
  );
}
