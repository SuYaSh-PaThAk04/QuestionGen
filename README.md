# QPGen — Question Paper Generator

A premium dark Next.js application for CO-based automated question paper generation.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Excel File Format

| Section   | CO  | Question                          |
|-----------|-----|-----------------------------------|
| Section A | CO1 | What is the definition of...      |
| Section A | CO1 | Explain the concept of...         |
| Section A | CO2 | Describe the process of...        |
| Section B | CO1 | Analyze the relationship...       |
| ...       | ... | ...                               |

**Rules:**
- Section values: `Section A`, `Section B`, `Section C`
- CO values: `CO1`, `CO2`, `CO3`
- Distribution per section: `2×CO1 + 2×CO2 + 1×CO3 = 5 questions`
- Minimum questions needed per CO per section: CO1=2, CO2=2, CO3=1

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **SheetJS (xlsx)** — Excel parsing & export
- **Framer Motion** — Animations

## Design

Premium dark theme featuring:
- Obsidian dark backgrounds with ambient gold/electric orbs
- Playfair Display serif headings
- Shimmer gradient text animation
- Noise texture overlay
- Glass card surfaces
- CO-coded color badges (Electric=CO1, Jade=CO2, Gold=CO3)
