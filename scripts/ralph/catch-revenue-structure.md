# Catch and Revenue Page Structure - Shiny vs React

## Catch Page

### Shiny Structure (Original):
1. **Header:** Municipality dropdown filter
2. **Row 1 (col-lg-8 + col-lg-4):**
   - **Left (col-lg-8):** Time series chart (catch over time) - height: 21rem
   - **Right (col-lg-4):** 3 summary cards stacked vertically
     - Card 1: Total catch (last 12 months) with trend
     - Card 2: Catch per trip (avg) with trend
     - Card 3: Active boats (last month) with trend icon
3. **Row 2 (col-12):**
   - **Full width:** Treemap showing habitat catch distribution - height: 28rem
   - Title: From `pars$catch$treemap$title`
   - Description: From `pars$catch$treemap$description`
4. **Row 3 (col-lg-7 + col):**
   - **Left (col-lg-7):** Summary table
   - **Right (col):** Variable descriptions card

### React Current Issues:
- ✅ Row 1 is correct
- ❌ Row 2: Has simple table instead of Treemap
- ❌ Missing: Variable descriptions card

---

## Revenue Page

### Shiny Structure (Original):
1. **Header:** Municipality dropdown filter
2. **Row 1 (col-lg-8 + col-lg-4):**
   - **Left (col-lg-8):** Time series chart (revenue over time) - height: 21rem
   - **Right (col-lg-4):** 3 summary cards stacked vertically
     - Card 1: Total revenue (last 12 months) with trend
     - Card 2: Revenue per trip (avg) with trend
     - Card 3: Price per kg (avg) with trend icon
3. **Row 2 (col-12):**
   - **Full width:** Treemap showing habitat revenue distribution - height: 28rem
   - Title: From `pars$revenue$treemap$title`
   - Description: From `pars$revenue$treemap$description`
4. **Row 3 (col-lg-7 + col):**
   - **Left (col-lg-7):** Summary table
   - **Right (col):** Variable descriptions card

### React Current Issues:
- ✅ Row 1 is correct
- ❌ Row 2: Has col-lg-6 Radar + col-lg-6 Treemap (WRONG LAYOUT)
  - Should be: col-12 Treemap (full width)
  - Radar chart is NOT in the original Shiny app for Revenue page
- ❌ Missing: Variable descriptions card

---

## Required Changes

### Catch Page:
1. Replace the simple table (row 2) with full-width Treemap (col-12)
2. Add Row 3 with col-lg-7 Summary table + col Variable descriptions

### Revenue Page:
1. Remove Radar chart
2. Make Treemap full width (col-12) instead of col-lg-6
3. Add col-lg-7 Summary table + col Variable descriptions below treemap

---

## Treemap Data Structure

Both pages use `summary_data` which contains:
- `revenue_habitat`: Array of habitat objects with nested gear data
- `catch_habitat`: Array of habitat objects with nested gear data (if exists)

Example structure:
```json
{
  "revenue_habitat": [
    {
      "name": "Reef",
      "data": [
        { "x": "Hand line", "y": 1234567 },
        { "x": "Spear gun", "y": 987654 }
      ]
    }
  ]
}
```

The Treemap should flatten this hierarchical structure showing:
- "Reef: Hand line" = 1234567
- "Reef: Spear gun" = 987654
- etc.

---

## Variable Descriptions Card

This card contains:
- **Heading:** From `pars$revenue$description$heading$text` (or `pars$catch$description$heading$text`)
- **Content:** Markdown text from `pars$revenue$description$content$text`
- **Subheading:** From `pars$revenue$description$subheading$text`
- Uses accordion/collapsible format for variable definitions

Layout class: `col` (flexible width, paired with col-lg-7 table)
