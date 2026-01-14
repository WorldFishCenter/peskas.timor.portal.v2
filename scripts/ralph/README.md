# Ralph - Shiny to React Conversion Agent

This directory contains the Ralph agent configuration for converting the Golem Shiny app to React.

## Quick Start

1. **Run Ralph**:
   ```bash
   cd scripts/ralph
   ./ralph.sh 20  # Run up to 20 iterations
   ```

2. **Monitor Progress**:
   - Check `progress.txt` for detailed logs
   - Check `prd.json` to see which stories have `passes: true`

3. **Manual intervention** (if needed):
   - Review the latest progress entry in `progress.txt`
   - Check the thread URL to see what the agent did
   - Manually fix any issues and update the PRD

## Files

- **prd.json**: Product requirements with 14 user stories for the conversion
- **prompt.md**: Instructions for the Ralph agent
- **progress.txt**: Running log of all iterations and learnings
- **ralph.sh**: Shell script that runs the agent loop

## Architecture

### Source (Shiny App)
Location: `peskas.timor.portal/`

Key files:
- `R/app_ui.R` - Main UI structure
- `R/tab_*.R` - Tab content (home, catch, market, nutrients, revenue, tracks)
- `R/mod_*.R` - Reusable Shiny modules (map, charts, tables)
- `R/data_*.R` - Data loading functions
- `inst/app/www/custom.css` - Custom styling

### Target (React App)
Location: Root directory

Key directories:
- `src/pages/` - Page components (one per tab)
- `src/components/` - Reusable components
- `public/data/` - JSON data files (already converted from Shiny RDA files)
- `src/i18n.tsx` - Internationalization

**Note**: All Shiny RDA data files have already been converted to JSON format and are available in `public/data/`.

## Conversion Strategy

1. **Analysis First** (US-001): Understand the Shiny app structure completely
2. **Data Layer** (US-002): Setup data fetching to match Shiny
3. **Page-by-Page** (US-003 to US-010): Convert each tab systematically
4. **Interactivity** (US-011): Implement filters and state management
5. **Visual QA** (US-012 to US-014): Ensure exact visual match

## Tips

- Ralph will work on ONE user story per iteration
- Each iteration commits its changes with `feat: [Story ID] - [Story Title]`
- Ralph updates the PRD to mark stories as `passes: true` when complete
- Check the "Codebase Patterns" section in `progress.txt` for accumulated learnings
- Ralph will stop automatically when all stories pass

## Monitoring Ralph

Ralph will:
- ✅ Create a branch `ralph/shiny-to-react-conversion`
- ✅ Pick the highest priority incomplete story
- ✅ Implement it
- ✅ Run quality checks (typecheck, lint)
- ✅ Commit changes
- ✅ Update PRD and progress log
- ✅ Repeat until all stories pass

If Ralph gets stuck:
1. Check the latest thread URL in `progress.txt`
2. Review what went wrong
3. Either fix manually or adjust the PRD
4. Re-run Ralph

## Expected Timeline

With 14 user stories and ~2-3 iterations per story (on average), expect:
- 30-50 total iterations
- Can run in batches: `./ralph.sh 10` multiple times
- Ralph will append to existing progress, not restart

## Verification

Each frontend story requires browser verification:
- Ralph loads the dev-browser skill
- Navigates to the page
- Verifies the changes work
- Takes screenshots for the progress log

Stories are NOT marked as passing until browser verification succeeds.
