# Iteration 7 Timeout Analysis

## What Happened
Ralph iteration 7 timed out (15 minutes) while working on **US-003c4: Apply donutBlue color palette to charts**.

## Progress Before Timeout
✅ **Completed stories (10 total):**
1. US-001: Shiny analysis
2. US-002a: Core TypeScript interfaces
3. US-002b: Remaining TypeScript interfaces  
4. US-002c: Data loading utilities
5. US-002d: Test data loading
6. US-003a: Home page structure
7. US-003b1: Install React Leaflet
8. US-003b2: Create FishingMap component
9. US-003b3: Add map to Home with coordinates
10. US-003b4: Style map basemap
11. US-003c1: Create DonutChart component
12. US-003c2: Add 3 donut instances to Home
13. US-003c3: Load real data into donuts

## Timeout Story Analysis
**US-003c4** originally involved:
1. Read shiny-analysis.md to extract donutBlue palette
2. Create src/constants/colors.ts file
3. Update 3 donut chart components on Home.tsx
4. Browser verification

**Problem:** 4 distinct steps requiring multiple file operations + verification.

## Solution Applied
Split US-003c4 into 2 atomic stories:
- **US-003c4**: Extract and document donutBlue palette (create colors.ts only)
- **US-003c5**: Apply colors to charts (import + update Home.tsx only)

## Additional Splits
Preemptively split 5 more complex stories to prevent future timeouts:

1. **US-003d2** → US-003d2 + US-003d3 (add table vs format table)
2. **US-004c** → US-004c1 + US-004c2 (create filter UI vs connect logic)
3. **US-011b** → US-011b1 + US-011b2 + US-011b3 (connect filters per page group)
4. **US-012a** → US-012a1 + US-012a2 + US-012a3 (extract vs add vs apply colors)

## New Complexity Rules
**Golden Rule:** 1 file edit + 1 build + browser check = 1 story maximum

**Decomposition Patterns:**
- "Extract X" ≠ "Apply X"
- "Create component" ≠ "Add to page" ≠ "Style component"
- "Create UI" ≠ "Connect logic"
- Library install = separate story

**Time Estimates:**
- File read/write: 1-2 min
- TypeScript build: 1 min
- npm install: 2-5 min
- Browser verification: 2-3 min
- Chart creation: 3-5 min
- **Total budget: 10 min per story** (5 min buffer for 15 min timeout)

## Story Count Evolution
- Original PRD: 14 stories (too complex, multiple timeouts)
- First split: 25 → 44 stories (still had US-003b, US-003c4 timeouts)
- Second split: 44 → 51 stories (current, targeting 3-5 min each)

## Next Steps for Ralph
Resume with US-003c4 (now simplified to just extract palette, no chart updates).

Expected completion time per story: **3-7 minutes**
Timeout buffer: **8-12 minutes** (safe margin)

## Files Changed
- scripts/ralph/prd.json (44 → 51 stories)
- scripts/ralph/progress.txt (added complexity rules section)
- scripts/ralph/iteration-7-analysis.md (this file)
