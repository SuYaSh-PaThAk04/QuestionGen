export const SECTIONS = ["Section A", "Section B", "Section C"] as const;
export type SectionName = typeof SECTIONS[number];
export type COKey = "CO1" | "CO2" | "CO3";

export const CO_RULES: Record<COKey, number> = { CO1: 2, CO2: 2, CO3: 1 };

export interface QuestionEntry {
  co: COKey;
  question: string;
}

export interface QuestionBank {
  [section: string]: Record<COKey, string[]>;
}

export interface GeneratedPaper {
  [section: string]: QuestionEntry[];
}

export interface ValidationResult {
  bank: QuestionBank;
  errors: string[];
  totalQuestions: number;
}

export function pickRandom<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

/**
 * Detect which column index holds the CO value by scanning the header row.
 * Returns the 0-based column index, or -1 if not found.
 */
function findCOColumnIndex(headerRow: unknown[]): number {
  for (let i = 0; i < headerRow.length; i++) {
    const cell = String(headerRow[i] ?? "").trim().toUpperCase();
    if (cell === "CO") return i;
  }
  return -1;
}

/**
 * Detect which column index holds the question text by scanning the header row.
 */
function findQuestionColumnIndex(headerRow: unknown[]): number {
  for (let i = 0; i < headerRow.length; i++) {
    const cell = String(headerRow[i] ?? "").trim().toUpperCase();
    if (cell === "QUESTION" || cell === "QUESTIONS") return i;
  }
  return -1;
}

/**
 * Try to parse the flat-column format:
 *   Columns: Section | CO | Question  (any order, detected by header row)
 * Returns totalQuestions parsed, or 0 if this format wasn't detected.
 */
function parseFlatFormat(
  rows: unknown[][],
  bank: QuestionBank
): number {
  // Find the header row (must contain "CO" and either "Section" or "Question")
  let headerIdx = -1;
  let sectionCol = -1;
  let coCol = -1;
  let questionCol = -1;

  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const row = rows[i];
    const cells = row.map((c) => String(c ?? "").trim().toUpperCase());
    const hasSection = cells.some((c) => c === "SECTION");
    const hasCO = cells.some((c) => c === "CO");
    const hasQ = cells.some((c) => c === "QUESTION" || c === "QUESTIONS");
    if (hasCO && (hasSection || hasQ)) {
      headerIdx = i;
      cells.forEach((c, idx) => {
        if (c === "SECTION") sectionCol = idx;
        if (c === "CO") coCol = idx;
        if (c === "QUESTION" || c === "QUESTIONS") questionCol = idx;
      });
      break;
    }
  }

  if (headerIdx === -1 || coCol === -1) return 0;

  let count = 0;
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    const rawSection = sectionCol >= 0 ? String(row[sectionCol] ?? "").trim() : "";
    const rawCO = String(row[coCol] ?? "").trim().toUpperCase();
    const question = questionCol >= 0 ? String(row[questionCol] ?? "").trim() : "";

    if (!rawCO || !question) continue;

    const matchedSection = SECTIONS.find(
      (s) =>
        s.toLowerCase() === rawSection.toLowerCase() ||
        s.replace("Section ", "").toLowerCase() === rawSection.toLowerCase()
    );
    if (!matchedSection) continue;
    if (!["CO1", "CO2", "CO3"].includes(rawCO)) continue;

    bank[matchedSection][rawCO as COKey].push(question);
    count++;
  }

  return count;
}

/**
 * Parse the "PART-A / PART-B / PART-C" exam format used by COER and similar institutions.
 *
 * Layout:
 *   - A header row contains "PART-A" (or "PART-B", "PART-C") in the first cell
 *     and "CO" as a label in the last occupied cell of that row.
 *   - Data rows: col[0]=Q number, col[1]=question text, col[-2]=BTL, col[-1]=CO value
 *
 * Maps: Part-A → Section A, Part-B → Section B, Part-C → Section C
 */
function parsePartFormat(
  rows: unknown[][],
  bank: QuestionBank
): number {
  const PART_SECTION_MAP: Record<string, SectionName> = {
    "PART-A": "Section A",
    "PART-B": "Section B",
    "PART-C": "Section C",
    "PARTA":  "Section A",
    "PARTB":  "Section B",
    "PARTC":  "Section C",
    "PART A": "Section A",
    "PART B": "Section B",
    "PART C": "Section C",
  };

  let currentSection: SectionName | null = null;
  let coColIndex = -1;
  let count = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => c === null || c === undefined || c === "")) continue;

    const firstCell = String(row[0] ?? "").trim().toUpperCase();

    // Check if this is a part-header row
    const partKey = Object.keys(PART_SECTION_MAP).find((k) =>
      firstCell.startsWith(k) || firstCell.includes(k)
    );
    if (partKey) {
      currentSection = PART_SECTION_MAP[partKey];
      // Detect which column holds the CO label in this header row
      for (let c = row.length - 1; c >= 0; c--) {
        const cell = String(row[c] ?? "").trim().toUpperCase();
        if (cell === "CO") {
          coColIndex = c;
          break;
        }
      }
      continue;
    }

    if (!currentSection) continue;

    // Data row: first cell should be a question number (numeric)
    const qNum = row[0];
    const isQuestionRow =
      qNum !== null &&
      qNum !== undefined &&
      qNum !== "" &&
      !isNaN(Number(qNum));

    if (!isQuestionRow) continue;

    // Question text is in column 1
    const question = String(row[1] ?? "").trim().replace(/\n/g, " ").replace(/\s+/g, " ");
    if (!question) continue;

    // CO value: prefer detected coColIndex, then scan from the right
    let rawCO = "";
    if (coColIndex >= 0 && row[coColIndex] !== undefined && row[coColIndex] !== null) {
      rawCO = String(row[coColIndex]).trim();
    } else {
      // Scan right-to-left for a numeric value that looks like a CO (1, 2, or 3)
      for (let c = row.length - 1; c >= 2; c--) {
        const cell = row[c];
        if (cell !== null && cell !== undefined && cell !== "") {
          const n = Number(cell);
          if (!isNaN(n) && [1, 2, 3].includes(n)) {
            rawCO = String(n);
            break;
          }
        }
      }
    }

    // Normalise: "1" → "CO1", "CO1" stays "CO1"
    let coKey: COKey | null = null;
    const rawNum = Number(rawCO);
    if (!isNaN(rawNum) && [1, 2, 3].includes(rawNum)) {
      coKey = `CO${rawNum}` as COKey;
    } else {
      const upper = rawCO.toUpperCase();
      if (["CO1", "CO2", "CO3"].includes(upper)) coKey = upper as COKey;
    }

    if (!coKey) continue;

    bank[currentSection][coKey].push(question);
    count++;
  }

  return count;
}

export function parseWorkbook(wb: import("xlsx").WorkBook): ValidationResult {
  const { utils } = require("xlsx");
  const errors: string[] = [];
  const bank: QuestionBank = {};
  let totalQuestions = 0;

  SECTIONS.forEach((sec) => {
    bank[sec] = { CO1: [], CO2: [], CO3: [] };
  });

  // Collect all rows from all sheets as raw 2-D arrays (no header inference)
  const allRows: unknown[][] = [];
  wb.SheetNames.forEach((name) => {
    const ws = wb.Sheets[name];
    const sheetRows = utils.sheet_to_json(ws, {
      header: 1,   // return arrays, not objects
      defval: null,
      blankrows: false,
    }) as unknown[][];
    allRows.push(...sheetRows);
  });

  // Try the PART-A/B/C exam format first (more specific)
  const partCount = parsePartFormat(allRows, bank);
  if (partCount > 0) {
    totalQuestions = partCount;
  } else {
    // Fallback: flat column format (Section | CO | Question headers)
    totalQuestions = parseFlatFormat(allRows, bank);
  }

  if (totalQuestions === 0) {
    errors.push(
      "No valid questions found. Supported formats:\n" +
      "1. Flat columns: Section | CO | Question\n" +
      "2. PART-A / PART-B / PART-C header rows with CO in the rightmost column."
    );
  }

  SECTIONS.forEach((sec) => {
    (Object.entries(CO_RULES) as [COKey, number][]).forEach(([co, needed]) => {
      const count = bank[sec][co].length;
      if (count < needed) {
        errors.push(`${sec} › ${co}: found ${count}, needs at least ${needed}.`);
      }
    });
  });

  return { bank, errors, totalQuestions };
}

export function generatePaper(bank: QuestionBank): GeneratedPaper {
  const paper: GeneratedPaper = {};
  SECTIONS.forEach((sec) => {
    paper[sec] = [];
    (Object.entries(CO_RULES) as [COKey, number][]).forEach(([co, n]) => {
      pickRandom(bank[sec][co], n).forEach((q) => {
        paper[sec].push({ co, question: q });
      });
    });
  });
  return paper;
}

export function exportToExcel(paper: GeneratedPaper, filename = "Question_Paper.xlsx") {
  const XLSX = require("xlsx");
  const wb = XLSX.utils.book_new();
  const allRows: (string | number)[][] = [];

  allRows.push(["AUTOMATED QUESTION PAPER", "", ""]);
  allRows.push(["Generated by QPGen", "", ""]);
  allRows.push(["", "", ""]);

  SECTIONS.forEach((sec, si) => {
    allRows.push([`SECTION ${String.fromCharCode(65 + si)} — ${sec.toUpperCase()}`, "", ""]);
    allRows.push(["Q.No", "Course Outcome", "Question"]);
    paper[sec].forEach((item, qi) => {
      allRows.push([qi + 1, item.co, item.question]);
    });
    allRows.push(["", "", ""]);
  });

  const ws = XLSX.utils.aoa_to_sheet(allRows);
  ws["!cols"] = [{ wch: 6 }, { wch: 16 }, { wch: 90 }];
  XLSX.utils.book_append_sheet(wb, ws, "Question Paper");
  XLSX.writeFile(wb, filename);
}
