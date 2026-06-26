# Responsive Upgrade Report

Date: 2026-06-26

## Scope

Audited the React/Vite frontend for mobile overflow and high-risk responsive surfaces across public pages, auth pages, dashboard shell, navbar, sidebar/drawer, shared cards, shared tables, shared modals, notifications, language switching, profile/edit profile, and chat.

This pass focused on production responsive foundations and the highest-impact shared components so existing candidate, recruiter, admin, jobs, blog, subscription, report, form, modal, and table screens inherit safer mobile behavior without changing business logic.

## Files Changed

- `client/src/styles/responsive.css`
  - Added global mobile safeguards for `min-width: 0`, media/image containment, touch target sizing, responsive grids/actions/forms, table wrappers, modal/dropdown sizing, chat viewport sizing, and RTL layout fixes.
- `client/src/layout/Layout.jsx`
  - Prevented global horizontal overflow and allowed chat/message routes to use a full-bleed viewport instead of a padded content shell.
- `client/src/components/dashboard/DashboardLayout.jsx`
  - Made dashboard content overflow-safe and gave chat/message routes a full-height mobile-friendly workspace.
- `client/src/components/header/Header2.jsx`
  - Improved mobile drawer behavior, scroll locking, route-change close behavior, inert closed state, profile dropdown sizing, and mobile action layout.
- `client/src/components/dashboard/ProfileDropdown.jsx`
  - Constrained dropdown width on small screens and used logical positioning for RTL.
- `client/src/components/notifications/NotificationDropdown.jsx`
  - Constrained notification dropdown height/width and used logical positioning.
- `client/src/components/languageSwitcher/LanguageSwitcher.jsx`
  - Prevented language labels from overflowing and improved compact/mobile behavior.
- `client/src/components/ui/Button.jsx`
  - Enforced 44px touch targets and safer button text wrapping.
- `client/src/components/ui/Card.jsx`
  - Added `min-w-0` safeguards so long content cannot stretch cards off-screen.
- `client/src/components/ui/StatCard.jsx`
  - Added truncation/min-width handling for dashboard metric cards.
- `client/src/components/ui/Table.jsx`
  - Added mobile card rendering under `sm` and kept scrollable tables for larger breakpoints.
- `client/src/components/ui/Modal.jsx`
  - Converted mobile modals into viewport-safe bottom sheets with scrollable bodies.
- `client/src/pages/common/chatpage/Chatpage.jsx`
  - Made chat layout full-height, mobile-first, and overflow-safe.
- `client/src/components/chatbox/ChatList.jsx`
  - Made conversation rows touch-friendly, keyboard-accessible, truncation-safe, and mobile-sized.
- `client/src/components/chatbox/Chatbox.jsx`
  - Improved mobile chat header, back button, message sizing, attachments, dropdown, fixed input area, and send button touch size.
- `client/src/components/chatbox/AvailableCandidates.jsx`
  - Made candidate rows touch-friendly, keyboard-accessible, and mobile-safe.
- `client/src/pages/common/profile/Profile.jsx`
  - Made profile headers, avatars, company details, resume panels, and edit actions stack cleanly on mobile.
- `client/src/pages/common/profile/edit/EditProfile.jsx`
  - Made profile edit forms, file controls, account details, and action buttons responsive.

## Responsive Behavior Added

- Breakpoint coverage: mobile `320-480`, large mobile `481-767`, tablet `768-1023`, laptop `1024-1279`, desktop `1280+`.
- Dashboard cards and dense grids collapse to one column on small mobile, then expand through tablet/desktop breakpoints.
- Tables now avoid page-level horizontal scrolling by using mobile cards where the shared table component is used, plus scroll wrappers for legacy hand-written tables.
- Modals and dropdowns are viewport-constrained and scroll internally on mobile.
- Chat now uses a full-screen mobile flow: list/candidate view first, selected conversation full screen, back button, bottom input, safe message wrapping, and responsive attachments.
- RTL safeguards cover navbar/drawer, forms, tables, chat bubbles, dropdowns, padding/start-end positioning, and text alignment for Urdu/Sindhi/Kashmiri style layouts.

## Verification

- `npm.cmd run build` passed.
- Existing Vite warning remains: `html2pdf-BgGyMFjK.js` is larger than 500 kB after minification. This is bundle-size/performance debt, not a responsive regression.
- Browser viewport checks passed with zero horizontal overflow on:
  - `/`
  - `/jobs`
  - `/blogs`
  - `/login`
  - `/register`
  - `/forgot-password`
  - `/jobs?lang=ur`
- Tested viewport widths:
  - `320`
  - `375`
  - `414`
  - `768`
  - `1024`
  - `1440`
- Verified English/LTR at `320px` on home, jobs, blogs, login, and register.
- Verified Urdu/RTL sets document direction to `rtl` and keeps zero horizontal overflow.
- Verified mobile drawer at `320px`:
  - Opens from the hamburger button.
  - Locks body scroll while open.
  - Navigating from the drawer closes it.
  - Closed drawer is `aria-hidden`, invisible, and pointer-inert.

## Authenticated QA Still Recommended

The browser runtime could not safely create a real authenticated candidate/recruiter/admin session in this environment, so interactive browser validation for protected dashboard data flows still needs a real login session.

Manual authenticated checks should cover:

- Candidate dashboard, recommended jobs, applied/saved jobs, resume builder, profile, notifications, and chat.
- Recruiter dashboard, company profile, job post/edit forms, applicants, ATS board, scheduler, subscription pages, analytics, and chat.
- Admin dashboard, users, companies, jobs, applications, subscriptions, reports, blogs, payments, tickets, and exports.
- Mobile drawer, dashboard sidebar, dropdowns, modals, tables, file uploads, date/time inputs, and long translated labels in English, Hindi, Marathi, Gujarati, and Urdu RTL.
