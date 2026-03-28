"use client";
import { useState } from "react";

const VALID_CREDENTIALS = [
  { id: "admin", password: "qpgen123" },
  { id: "faculty", password: "coer2025" },
];

interface LoginModalProps {
  onSuccess: () => void;
}

export default function LoginModal({ onSuccess }: LoginModalProps) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !password.trim()) {
      setError("Please enter both ID and password.");
      return;
    }

    setLoading(true);
    setError("");

    // Simulate a brief auth delay for polish
    await new Promise((r) => setTimeout(r, 600));

    const match = VALID_CREDENTIALS.find(
      (c) => c.id === userId.trim() && c.password === password
    );

    if (match) {
      onSuccess();
    } else {
      setLoading(false);
      setError("Invalid credentials. Please try again.");
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes overlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .modal-shake { animation: shake 0.45s ease; }
        .login-modal { animation: modalIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .login-overlay { animation: overlayIn 0.25s ease forwards; }

        .auth-input {
          width: 100%;
          background: var(--bg-surface);
          border: 1px solid var(--border-medium);
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .auth-input::placeholder { color: var(--text-muted); }
        .auth-input:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(232,197,71,0.12);
        }
        .auth-btn {
          width: 100%;
          padding: 12px;
          background: var(--gold);
          color: #080A0C;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .auth-btn:hover:not(:disabled) { opacity: 0.88; }
        .auth-btn:active:not(:disabled) { transform: scale(0.98); }
        .auth-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .show-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          color: var(--text-muted);
          transition: color 0.15s;
          display: flex;
          align-items: center;
        }
        .show-btn:hover { color: var(--text-secondary); }
      `}</style>

      {/* Backdrop */}
      <div
        className="login-overlay fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      >
        {/* Modal card */}
        <div
          className={`login-modal w-full max-w-sm rounded-2xl p-8 ${shaking ? "modal-shake" : ""}`}
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-medium)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
          }}
        >
          {/* Logo + title */}
          <div className="text-center mb-8">
            <div
              className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "var(--gold)", boxShadow: "0 0 30px rgba(232,197,71,0.35)" }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="2" y="2" width="18" height="18" rx="3" stroke="#080A0C" strokeWidth="1.8" />
                <line x1="6" y1="8" x2="16" y2="8" stroke="#080A0C" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="6" y1="11" x2="16" y2="11" stroke="#080A0C" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="6" y1="14" x2="11" y2="14" stroke="#080A0C" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              QPGen
            </h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Sign in to access the Question Paper Generator
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User ID */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                User ID
              </label>
              <div className="relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <circle cx="7.5" cy="5" r="3" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M1.5 13.5C1.5 11 4.2 9 7.5 9C10.8 9 13.5 11 13.5 13.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  className="auth-input"
                  style={{ paddingLeft: "36px" }}
                  type="text"
                  placeholder="Enter your user ID"
                  value={userId}
                  onChange={(e) => { setUserId(e.target.value); setError(""); }}
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Password
              </label>
              <div className="relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-muted)" }}
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <rect x="2.5" y="6" width="10" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    <circle cx="7.5" cy="9.5" r="1" fill="currentColor" />
                  </svg>
                </span>
                <input
                  className="auth-input"
                  style={{ paddingLeft: "36px", paddingRight: "40px" }}
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="show-btn"
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 8C2 8 4.5 3.5 8 3.5C11.5 3.5 14 8 14 8C14 8 11.5 12.5 8 12.5C4.5 12.5 2 8 2 8Z" stroke="currentColor" strokeWidth="1.2" />
                      <circle cx="8" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.2" />
                      <line x1="3" y1="13" x2="13" y2="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 8C2 8 4.5 3.5 8 3.5C11.5 3.5 14 8 14 8C14 8 11.5 12.5 8 12.5C4.5 12.5 2 8 2 8Z" stroke="currentColor" strokeWidth="1.2" />
                      <circle cx="8" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs"
                style={{ background: "var(--rose-dim)", border: "1px solid rgba(251,113,133,0.2)", color: "var(--rose)" }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="flex-shrink-0">
                  <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.1" />
                  <path d="M6.5 4V7M6.5 8.5V9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="auth-btn" disabled={loading} style={{ marginTop: "8px" }}>
              {loading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                    <circle cx="7" cy="7" r="5.5" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" />
                    <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke="#080A0C" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Verifying...
                </>
              ) : (
                <>
                  Sign in
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7H11M11 7L8 4M11 7L8 10" stroke="#080A0C" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Hint */}
          <p className="text-center text-xs mt-6" style={{ color: "var(--text-muted)" }}>
            Contact your administrator for access credentials.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
