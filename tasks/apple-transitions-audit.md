# Apple-Like Page And Project Transitions Audit

Date: 2026-07-01

## What Changed

- Added native cross-document View Transitions through shared CSS so same-origin page navigation has a soft Apple-like blur, lift, and settle.
- Added named transition roles for the persistent topbar, Divani mark, hero media, page body, project image, and project text.
- Rebuilt project switching to preload the next image, then update the project view through `document.startViewTransition()`.
- Added a fallback page-exit animation for browsers without View Transition support.
- Preserved reduced-motion behavior by disabling transition animations for users who request reduced motion.

## Fix During Audit

Chromium initially aborted the same-page project transition because the full-page `main` transition capture was active while nested project elements were also being transitioned. The fix temporarily disables the `main` transition name only for project switching, restores it as soon as the native transition is ready, and catches transition promises so aborted native animations never surface as runtime errors.

## Verification

- `node --check tasks\build-multipage-site.js`
- `node tasks\build-multipage-site.js`
- `node --check assets\site.js`
- `$env:SKIP_SCREENSHOTS='1'; node tasks\run-multipage-audit.js`
- CSS scan for viewport-scaled font sizes, non-zero letter spacing, and `url(...)` background image use.

Final browser audit result:

- 10 pages checked on desktop and mobile.
- 0 broken images.
- 0 missing visible `alt` attributes.
- 0 horizontal overflow.
- 0 unrevealed elements.
- 0 runtime/console errors.
- Project switch verified to the Lica Park project state with one active project button.
- Mobile drawer opens, reports `aria-hidden="false"`, updates the menu button to `aria-expanded="true"`, focuses the close button, and keeps the menu button at 46x46.
- Quote form WhatsApp URL generation still works.

Representative screenshots:

- `tasks/screenshots/apple-transitions-home-desktop.png`
- `tasks/screenshots/apple-transitions-home-mobile.png`
- `tasks/screenshots/apple-transitions-projects-desktop.png`
- `tasks/screenshots/apple-transitions-projects-mobile.png`
