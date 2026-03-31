# Scan and fix high vulnerabilities (npm audit)

You are helping to scan and fix **high** (and critical) vulnerabilities reported by `npm audit`. We **do not** use `npm audit fix` — it breaks too much. Instead we read the audit report, find the **patch/minimum safe version** for each vuln, and update dependencies manually.

**One vulnerability per run.** The user will run this command multiple times. Each run: pick **one** vulnerability report (one advisory), fix it, document it, and stop. That keeps scope clear — one fix, one report entry, one "Where the package is used" section per run.

## Prerequisites

- **Network:** Request network permission for any terminal command that runs `npm audit` or `npm install` (they hit the registry).
- **Node version:** **Always** run `nvm use` (or equivalent) before **every** `npm` command so the correct Node version is used (from `.nvmrc` or `package.json` engines). Do this in the same shell / command when you run `npm audit`, `npm install`, etc.

## What to do

1. **Scan**
   - Run `nvm use && npm audit --audit-level=high --json` with **network** permission. If output is large/truncated, run `nvm use && npm audit --audit-level=high --json > audit-high.json`, then read that file to parse.
   - From the JSON: list high/critical vulnerabilities (package, current version, advisory ID/title, fix version from advisory range, advisory URL). Prefer picking a **direct dependency** with a **patch/minor fix** (single advisory, clear fix version) so the change is small and low-risk.
   - **Pick one** vulnerability (one advisory) to fix. If the user specified which one (e.g. by package or advisory ID), use that; otherwise pick using the preference above. Fix only that one this run.

2. **Patch manually**
   - For the **chosen** vulnerability only: update the version in `package.json` to the minimum safe version from the advisory (e.g. if range is `<13.15.22`, set `^13.15.22` or `13.15.22`). No major/minor jumps unless the advisory requires it. Do **not** edit the lockfile by hand; `npm install` will update it.
   - Do **not** run `npm audit fix` or `npm audit fix --force`.
   - Run `nvm use && npm install` (with network), then `nvm use && npm audit --audit-level=high` to confirm that vuln is gone.

3. **Write the audit report file**
   - Use path **`audit-fix-report.md`** in the project root (or path the user specifies).
   - **Append** one entry for this run: if the file exists, add one row to the Changes table and one block under "Where the package is used" for this fix; if the file doesn't exist, create it with the header and this run's content.
   - For this run include:
     - **Changes table:** one row — Package | From | To | Advisory (ID + title) | Vuln link (advisory URL). Add a short "Why" if useful (e.g. "Prototype pollution").
     - **Where the package is used:** Search the codebase for where the patched package is **imported or required** (e.g. `import ... from 'package'`, `require('package')`, or re-exports). List **file paths** (and optional line/context) where the package appears. One bullet block per run — concrete locations only, no QC recommendations.

4. **Confirm**
   - Re-run `nvm use && npm audit --audit-level=high`. If it exits 0, we're done. If more high/critical remain, say so and that the user can run this command again to address the next.

## Notes

- Focus only on high and critical unless the user asks to include moderate/low.
- One vulnerability (one advisory) per run; do not batch multiple vulns in one go.
- Prefer patch-level bumps; only bump minor/major when the advisory requires it.
- Use the terminal for all npm commands; **always** prefix with `nvm use` (e.g. `nvm use && npm audit ...`, `nvm use && npm install`). Use the audit JSON (or saved file) to drive manual edits and the report.
