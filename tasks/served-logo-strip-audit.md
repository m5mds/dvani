# Served-By Logo Strip Audit

## Source Review

- Re-reviewed `divani profile.pdf`; the usable client-logo spreads are on profile pages 7-10.
- Extracted clean representative logos into `assets/client-logos/`.
- Used: AMAALA, Red Sea Global, Royal Commission for AlUla, NEOM, GACA, SIAC Construction, Hayyak Lounge, BEC Arabia, Six Senses, Le Meridien, House Express, Rosewood Hotel Group, and Crowne Plaza.
- Skipped noisy or clipped candidates from the profile crop pass so the strip does not inherit bad background fragments.

## Implementation

- Added a dedicated `served-strip` section directly after the hero and before the restored project showcase.
- The strip uses a duplicated logo group for a continuous marquee and keeps the second group hidden from assistive tech.
- Fixed two layout defects found during visual QA: the RTL parent was pushing the marquee track off-screen, and default `figure` margins were creating oversized gaps between logos.
- Added `direction:ltr` on the marquee and reset logo figure margins so the strip stays dense on desktop and mobile.
- Reduced-motion support is preserved; the marquee stops when `prefers-reduced-motion: reduce` is active.

## Consistency Checks

- Structure still flows: hero, served strip, project showcase, capability, details, contact, footer.
- No project showcase functionality was removed or weakened.
- No CSS project-photo background images were introduced.
- All referenced logo/image assets exist.
- Navigation anchors remain valid.
- Logo duplicates are intentional for seamless motion.

## Browser Verification

- Ran `AUDIT_SUFFIX=served node tasks/run-browser-audit.js`.
- Result: no broken images, no missing local anchors, no horizontal overflow, no runtime errors, and no unrevealed content.
- Project switching still changes to Lica Park with only one active project button.
- Mobile drawer still opens with `aria-hidden=false`, `aria-expanded=true`, and focus on the close control.
- Final screenshots: `tasks/screenshots/desktop-served.png`, `tasks/screenshots/mobile-served.png`, and `tasks/screenshots/mobile-menu-served.png`.
