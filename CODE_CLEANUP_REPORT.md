# MERN Job Placement Code Cleanup Report

Date: 2026-06-24

## Scope

Performed a repository cleanup pass across the React/Vite frontend and Node/Express backend. The pass focused on verified unused code, duplicate modules, stale deployment artifacts, hardcoded production URLs, noisy runtime logging, unused dependencies, and stale public assets.

No uncertain product-facing pages were removed. Items that looked potentially unused but could belong to planned Candidate/Recruiter/Admin features were kept and listed below.

## Removed

### Backend Routes And Controllers

- `server/routes/recruiter.route.js`
- `server/controllers/recruiter.controller.js`

These files were not mounted by `server/server.js`, and frontend code did not call the `/api/v1/recruiter` route surface.

- `server/routes/interviews.route.js`

This was a duplicate/unmounted interview route file. The active mounted route is `server/routes/interview.route.js`.

### Backend Duplicate Or Unused Middleware

- `server/middlewares/asyncHandler.js`
- `server/middlewares/validate.middleware.js`
- `server/middlewares/validator.js`

These middleware files were not imported by the application. `server/middlewares/asyncHandler.middleware.js` remains as the active async handler.

### Backend Unused Validation Layer

- `server/utils/validation.js`
- `server/validations/auth.validation.js`
- `server/validations/company.validation.js`
- `server/validations/job.validation.js`
- Removed now-empty `server/validations/` directory

The current route stack does not import this validation layer. Removing it also allowed cleanup of the unused `express-validator` dependency.

### Backend Unused Security Helpers And Dependencies

Removed unused exports from `server/middlewares/security.js`:

- `mongoSanitizeMiddleware`
- `xssProtection`
- `hppProtection`
- `securityHeaders`
- `requestLogger`
- `validateApiKey`
- `validateFileUpload`

Removed unused/deprecated dependencies from `server/package.json` and `server/package-lock.json`:

- `crypto`
- `express-mongo-sanitize`
- `express-validator`
- `hpp`
- `xss-clean`

The project uses Node's built-in `crypto` module where crypto functionality is needed, so the deprecated npm package was removed.

### Stale Backend Files

- `server/SECURITY_SETUP.md`
- `server/package.json.example`
- `server/docker.yml`

These were stale/unreferenced artifacts. The active Docker setup remains in the root compose files and Dockerfiles.

### Frontend Unused Components And Assets

- `client/src/components/AdminLayout.jsx`
- `client/src/components/ProtectedAdminRoute.jsx`
- `client/public/1.jpg`
- `client/public/2.jpg`
- Removed empty `client/src/components/sidepanel/` directory

These components and assets were not imported or referenced by the app.

## Refactored

### Backend Logging

- `server/controllers/user.controller.js`

Replaced direct runtime `console.log` / `console.error` calls with the backend logger utility.

### Backend Startup Output

- `server/server.js`

Removed a disabled/commented startup log banner and left the actual server bootstrap behavior unchanged.

### Frontend API Base URL

- `client/src/api/api.js`

Replaced old Render fallback URL with production-safe same-origin fallback:

- Production fallback: `/api/v1`
- Development fallback: `http://localhost:3000/api/v1`

This aligns the frontend with the production reverse proxy path `https://www.jewelcancy.com/api/v1`.

Also centralized debug-only API logging behind `DEBUG_MODE`.

### Frontend Socket URL

- `client/src/context/SocketContext.jsx`

Replaced the hardcoded old Socket.IO backend URL with production-safe same-origin fallback:

- Production fallback: `window.location.origin`
- Development fallback: `http://localhost:3000`

Also changed browser notification icon from missing `/logo192.png` to existing `/logo.png`.

### Frontend Runtime Logging Cleanup

- `client/src/pages/common/home/Home.jsx`
- `client/src/auth/login/Login.jsx`
- `client/src/pages/recruiter/subscription/useSubscriptionPayment.js`

Removed noisy debug warnings and stale commented debug JSX while preserving behavior.

## Kept Intentionally

### Candidate Feature Pages

The following files may not currently be part of the main navigation flow, but they map directly to requested business features and were kept:

- `client/src/pages/candidates/candidate/CandidateDashboard.jsx`
- `client/src/pages/candidates/candidate/JobAlerts.jsx`
- `client/src/pages/candidates/candidate/JobRecommendations.jsx`
- `client/src/pages/candidates/candidate/SavedJobs.jsx`

### Lazy-Loaded Frontend Routes

Lazy imports and route components under `client/src/main.jsx` were kept, even when static searching made some components look indirectly referenced only.

### Locale Trees

Both locale trees were kept because `client/src/i18n/index.js` supports dynamic loading from both locations:

- `client/src/i18n/locales/`
- `client/src/locales/`

### Debug-Mode Console Helpers

The remaining frontend `console.*` usage is gated behind `DEBUG_MODE` helpers in:

- `client/src/api/api.js`
- `client/src/context/SocketContext.jsx`
- `client/src/pages/recruiter/RecruiterDashboard.jsx`

These are intentionally retained for local debugging and do not run in production unless debug mode is explicitly enabled.

### Runtime Upload Folders

Empty upload target folders under `server/uploads/` were kept because they are runtime storage locations for uploaded files.

### CLI Scripts

Console output inside `server/scripts/` was kept because those files are command-line utilities where terminal output is expected.

## Verification

Completed checks:

- `node --check server\server.js`
- `node --check server\controllers\user.controller.js`
- `node --check server\middlewares\security.js`
- `npm.cmd test -- --runInBand --coverage=false` in `server`
- `npm.cmd run build` in `client`
- `docker compose -f docker-compose.yml config --quiet`
- `docker compose -f docker-compose.prod.yml config --quiet`

Results:

- Backend syntax checks passed.
- Backend Jest suite passed: 1 suite, 4 tests.
- Frontend production build passed.
- Docker Compose config validation passed.

Notes:

- Docker Compose emitted a local warning: `C:\Users\Admin\.docker\config.json: Access is denied`. The compose files still parsed successfully.
- Frontend build still reports the existing large lazy chunk warning for `html2pdf-BgGyMFjK.js`. This is not a cleanup regression.
- `npm uninstall` emitted local engine warnings because this machine is running Node `v24.15.0` / npm `11.12.1`, while the backend declares Node 22 and npm `<11`.

## Estimated Impact

- Removed 17 verified unused files.
- Removed 2 empty directories.
- Removed 5 direct backend dependencies and related transitive lockfile entries.
- Removed stale public image assets.
- Reduced backend attack surface by deleting unmounted routes, unused middleware, and stale validation/security helpers.
- Improved deployment readiness by removing old hardcoded backend URLs from frontend API and Socket.IO fallbacks.
- Reduced production log noise by removing non-debug runtime console output.

