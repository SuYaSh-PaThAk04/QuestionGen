"use client";
import { useState, useCallback, useRef } from "react";
import * as XLSX from "xlsx";
import { StepIndicator, Btn, COBadge, StatCard, SectionRule } from "@/components/ui";
import { parseWorkbook, generatePaper, exportToExcel, SECTIONS, CO_RULES } from "@/lib/qpgen";
import type { QuestionBank, GeneratedPaper, COKey } from "@/lib/qpgen";
import LoginModal from "@/components/LoginModal";

type Step = "upload" | "validate" | "paper";

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [step, setStep] = useState<Step>("upload");
  const [bank, setBank] = useState<QuestionBank | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [paper, setPaper] = useState<GeneratedPaper | null>(null);
  const [fileName, setFileName] = useState("");
  const [totalQ, setTotalQ] = useState(0);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File | null) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result as ArrayBuffer, { type: "array" });
        const { bank: parsed, errors: errs, totalQuestions } = parseWorkbook(wb);
        setBank(parsed);
        setErrors(errs);
        setTotalQ(totalQuestions);
        setStep("validate");
      } catch {
        setErrors(["Failed to read file. Please ensure it is a valid .xlsx file."]);
        setStep("validate");
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      processFile(e.dataTransfer.files[0] ?? null);
    },
    [processFile]
  );

  const handleGenerate = () => {
    if (!bank) return;
    setPaper(generatePaper(bank));
    setStep("paper");
  };

  const handleRegenerate = () => {
    if (!bank) return;
    setPaper(generatePaper(bank));
  };

  const handleReset = () => {
    setStep("upload");
    setBank(null);
    setErrors([]);
    setPaper(null);
    setFileName("");
    setTotalQ(0);
  };

  const stepNum = step === "upload" ? 1 : step === "validate" ? 2 : 3;

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Login gate — shown until authenticated ── */}
      {!authenticated && (
        <LoginModal onSuccess={() => setAuthenticated(true)} />
      )}

      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-6 py-4 sticky top-0 z-40"
        style={{ background: "rgba(8,10,12,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--gold)", boxShadow: "0 0 20px rgba(232,197,71,0.3)" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1.5" y="1.5" width="13" height="13" rx="2" stroke="#080A0C" strokeWidth="1.4" />
              <line x1="4" y1="5.5" x2="12" y2="5.5" stroke="#080A0C" strokeWidth="1.3" strokeLinecap="round" />
              <line x1="4" y1="8" x2="12" y2="8" stroke="#080A0C" strokeWidth="1.3" strokeLinecap="round" />
              <line x1="4" y1="10.5" x2="9" y2="10.5" stroke="#080A0C" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <span className="font-display font-semibold text-base tracking-tight" style={{ color: "var(--text-primary)" }}>
              QPGen
            </span>
            <span className="text-xs ml-2 hidden sm:inline" style={{ color: "var(--text-muted)" }}>
              Question Paper Generator
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <StepIndicator current={stepNum} />
          {authenticated && (
            <button
              onClick={() => setAuthenticated(false)}
              className="text-xs px-3 py-1.5 rounded-lg transition-all duration-150 hover:opacity-80"
              style={{ background: "var(--bg-elevated)", color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}
            >
              Sign out
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start px-4 py-12">
        <div className="w-full max-w-2xl stagger">
          {/* ─── STEP 1: UPLOAD ─── */}
          {step === "upload" && (
            <div key="upload">
              <div className="mb-10 text-center">
                <div className="inline-block mb-3 text-xs font-mono tracking-widest uppercase px-3 py-1 rounded-full"
                  style={{ background: "var(--gold-dim)", color: "var(--gold)", border: "1px solid rgba(232,197,71,0.2)" }}>
                  Step 1 of 3
                </div>
                <h1 className="font-display text-4xl font-semibold mb-3 shimmer-text">Upload Question Bank</h1>
                <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
                  Upload an Excel (.xlsx) file with columns <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--bg-elevated)", color: "var(--electric)" }}>Section</span>,{" "}
                  <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--bg-elevated)", color: "var(--jade)" }}>CO</span>, and{" "}
                  <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--bg-elevated)", color: "var(--gold)" }}>Question</span>.
                </p>
              </div>

              {/* Format info */}
              <div className="rounded-xl p-4 mb-6 flex flex-wrap gap-4 justify-between text-sm"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                <div>
                  <div className="text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>Section values</div>
                  <div className="flex gap-2 flex-wrap">
                    {["Section A", "Section B", "Section C"].map(s => (
                      <span key={s} className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: "var(--bg-surface)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>CO values</div>
                  <div className="flex gap-2">
                    <COBadge co="CO1" /><COBadge co="CO2" /><COBadge co="CO3" />
                  </div>
                </div>
                <div>
                  <div className="text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>Distribution per section</div>
                  <div className="text-xs font-mono" style={{ color: "var(--gold)" }}>2×CO1 + 2×CO2 + 1×CO3 = 5 Qs</div>
                </div>
              </div>

              {/* Drop zone */}
              <div
                className={`rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${dragging ? "drop-zone-active" : ""}`}
                style={{
                  border: "1.5px dashed var(--border-medium)",
                  background: dragging ? "var(--gold-dim)" : "var(--bg-elevated)",
                }}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                  style={{ background: "var(--gold-dim)", border: "1px solid rgba(232,197,71,0.2)" }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M14 18V8M14 8L10 12M14 8L18 12" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M24 19.5C25.7 18.5 27 16.6 27 14.5C27 11.5 24.5 9 21.5 9C21.3 9 21.1 9 20.9 9C20.2 6 17.4 4 14 4C9.6 4 6 7.5 6 12V12.5C3.2 13.2 1 15.8 1 19C1 22.3 3.7 25 7 25H22C23 25 23.7 24.8 24 24.5" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="font-medium text-base mb-1" style={{ color: "var(--text-primary)" }}>
                  {dragging ? "Drop it!" : "Drop your Excel file here"}
                </p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>or click to browse — .xlsx, .xls</p>
              </div>
              <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => processFile(e.target.files?.[0] ?? null)} />
            </div>
          )}

          {/* ─── STEP 2: VALIDATE ─── */}
          {step === "validate" && (
            <div key="validate">
              <div className="mb-8 text-center">
                <div className="inline-block mb-3 text-xs font-mono tracking-widest uppercase px-3 py-1 rounded-full"
                  style={{ background: errors.length === 0 ? "var(--jade-dim)" : "var(--rose-dim)", color: errors.length === 0 ? "var(--jade)" : "var(--rose)", border: `1px solid ${errors.length === 0 ? "rgba(74,222,128,0.2)" : "rgba(251,113,133,0.2)"}` }}>
                  Step 2 of 3
                </div>
                <h1 className="font-display text-4xl font-semibold mb-2 shimmer-text">Validation Report</h1>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Parsed <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}>{fileName}</span>
                </p>
              </div>

              {/* Stat row */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <StatCard label="Total questions" value={totalQ} accent="var(--electric)" />
                <StatCard label="Sections detected" value={SECTIONS.filter(s => bank && (bank[s].CO1.length + bank[s].CO2.length + bank[s].CO3.length) > 0).length + "/3"} accent="var(--gold)" />
                <StatCard label="Issues found" value={errors.length} accent={errors.length === 0 ? "var(--jade)" : "var(--rose)"} />
              </div>

              {/* Error box */}
              {errors.length > 0 && (
                <div className="rounded-xl p-4 mb-5" style={{ background: "var(--rose-dim)", border: "1px solid rgba(251,113,133,0.2)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="var(--rose)" strokeWidth="1.2"/><path d="M7 4.5V7.5M7 9.5V10" stroke="var(--rose)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    <span className="text-xs font-medium" style={{ color: "var(--rose)" }}>Fix these issues before generating</span>
                  </div>
                  {errors.map((err, i) => (
                    <p key={i} className="text-xs leading-relaxed pl-5" style={{ color: "rgba(251,113,133,0.8)" }}>• {err}</p>
                  ))}
                </div>
              )}

              {/* Section breakdown */}
              {bank && (
                <div className="rounded-xl overflow-hidden mb-6" style={{ border: "1px solid var(--border-subtle)" }}>
                  <div className="px-4 py-3 text-xs font-medium" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)", borderBottom: "1px solid var(--border-subtle)" }}>
                    Question bank breakdown
                  </div>
                  <div className="divide-y divide-[var(--border-subtle)]">
                    {SECTIONS.map((sec, si) => {
                      const colors = ["var(--electric)", "var(--gold)", "var(--jade)"];
                      return (
                        <div key={sec} className="px-4 py-3 flex items-center gap-4">
                          <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-mono font-bold flex-shrink-0"
                            style={{ background: `${colors[si]}18`, color: colors[si] }}>
                            {String.fromCharCode(65 + si)}
                          </div>
                          <span className="text-sm font-medium flex-1" style={{ color: "var(--text-primary)" }}>{sec}</span>
                          <div className="flex gap-2">
                            {(["CO1", "CO2", "CO3"] as COKey[]).map((co) => {
                              const count = bank[sec][co].length;
                              const needed = CO_RULES[co];
                              const ok = count >= needed;
                              return (
                                <div key={co} className="flex items-center gap-1.5">
                                  <COBadge co={co} />
                                  <span className="text-xs font-mono" style={{ color: ok ? "var(--jade)" : "var(--rose)" }}>
                                    {count}{ok ? "✓" : `↑${needed}`}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-3 flex-wrap">
                {errors.length === 0 && bank && (
                  <Btn variant="primary" onClick={handleGenerate}
                    icon={<svg viewBox="0 0 16 16" fill="none"><path d="M8 3L13 8L8 13M3 8H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}>
                    Generate paper
                  </Btn>
                )}
                <Btn variant="ghost" onClick={handleReset}
                  icon={<svg viewBox="0 0 16 16" fill="none"><path d="M3 8A5 5 0 1 0 5.5 3.5M3 3v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>}>
                  Upload different file
                </Btn>
              </div>
            </div>
          )}

          {/* ─── STEP 3: PAPER ─── */}
          {step === "paper" && paper && (
            <div key="paper">
              <div className="mb-8 text-center">
                <div className="inline-block mb-3 text-xs font-mono tracking-widest uppercase px-3 py-1 rounded-full"
                  style={{ background: "var(--jade-dim)", color: "var(--jade)", border: "1px solid rgba(74,222,128,0.2)" }}>
                  Complete
                </div>
                <h1 className="font-display text-4xl font-semibold mb-2 shimmer-text">Question Paper</h1>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  15 questions across 3 sections · randomly selected
                </p>
              </div>

              {/* Summary bar */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                <StatCard label="Total questions" value={15} accent="var(--text-primary)" />
                <StatCard label="Sections" value={3} accent="var(--gold)" />
                <StatCard label="Per section" value="5 Qs" accent="var(--electric)" />
              </div>

              {/* Paper */}
              <div className="rounded-2xl overflow-hidden mb-6"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
                <div className="px-6 py-4 flex items-center justify-between"
                  style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
                  <span className="font-display font-medium text-sm" style={{ color: "var(--text-primary)" }}>Generated Question Paper</span>
                  <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{new Date().toLocaleDateString()}</span>
                </div>

                <div className="px-6 py-6">
                  {SECTIONS.map((sec, si) => (
                    <div key={sec} className="mb-8 last:mb-0">
                      <SectionRule label={sec} index={si} />
                      <div className="space-y-0">
                        {paper[sec].map((item, qi) => (
                          <div
                            key={qi}
                            className="flex items-start gap-4 py-3.5 group transition-colors duration-150"
                            style={{ borderBottom: qi < paper[sec].length - 1 ? "1px solid var(--border-subtle)" : "none" }}
                          >
                            <span className="text-xs font-mono mt-0.5 w-5 flex-shrink-0 text-right" style={{ color: "var(--text-muted)" }}>
                              {qi + 1}
                            </span>
                            <span className="text-sm leading-relaxed flex-1" style={{ color: "var(--text-primary)" }}>
                              {item.question}
                            </span>
                            <COBadge co={item.co} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 flex-wrap">
                <Btn variant="primary" onClick={() => exportToExcel(paper)}
                  icon={<svg viewBox="0 0 16 16" fill="none"><path d="M8 10V3M8 10L5.5 7.5M8 10L10.5 7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 13H14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>}>
                  Download Excel
                </Btn>
                <Btn variant="secondary" onClick={handleRegenerate}
                  icon={<svg viewBox="0 0 16 16" fill="none"><path d="M14 8A6 6 0 1 1 10 2.5M14 2v3.5H10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>}>
                  Regenerate
                </Btn>
                <Btn variant="danger" onClick={handleReset}
                  icon={<svg viewBox="0 0 16 16" fill="none"><path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>}>
                  Start over
                </Btn>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs" style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)" }}>
        QPGen · CO-based question paper generation · Built with Next.js
      </footer>
    </div>
  );
}
