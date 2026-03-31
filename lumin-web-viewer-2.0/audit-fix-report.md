# Audit fix report (high/critical)

Manual dependency updates from `pnpm audit --audit-level=high`. One fix per run.

## Changes

| Package | From | To | Advisory (ID + title) | Vuln link | Why |
|---------|------|-----|------------------------|-----------|-----|
| react-router / react-router-dom (→ @remix-run/router) | ^6.15.0 (router 1.8.0) | ^6.30.2 + pnpm override `@remix-run/router` >=1.23.2 | 1112052 — React Router vulnerable to XSS via Open Redirects | https://github.com/advisories/GHSA-2w69-qvjg-hvjx | XSS via open redirects in Framework/Data/RSC modes |

**Follow-up code change (react-router 6.30 compatibility):** In `src/lumin-components/CustomPrompt/CustomPrompt.js`, import updated from `unstable_useBlocker as useBlocker` to `useBlocker` — the API was stabilized in react-router 6.30 and the `unstable_` export was removed.

## Suggested scope of test

- **Routing & navigation:** App entry and route resolution (`RouterConfig`, `RouterProvider`, `RootRoute`); `Navigate` and `useNavigate()` usage (redirects after login, CAP block, document folder, gift flow, payment roots); `useParams` / `useLocation` / `matchPath` in DocumentFolder, Viewer, and settings. **Navigation blocking:** `CustomPrompt` (unsaved-changes / leave-page prompt) — confirm the blocker still works when navigating away with unsaved edits.
- **Screens to smoke-test:** Home, Viewer, DocumentFolder, Settings (and sub-routes), Payment (and free trial), OrganizationDashboard, OrganizationMember, JoinOrganizations, InviteLinkVerification, AccessBlockedByCAP, NotFound.
- **Auth and payment redirects:** Login/signup and post-auth redirects; payment and free-trial redirects (`Routers.PAYMENT`, `Routers.PAYMENT_FREE_TRIAL`, `getNewPaymentRedirector`); Kratos/auth flow routes.
- **Links and programmatic navigation:** Sidebar and nav items (ReskinLayout MainSidebar, DashboardSubSidebar, TemplateNavItem, SignNavItem); document list actions that navigate; ShareModal and org switcher navigation; TimeSensitiveCoupon GiftButton navigate.
