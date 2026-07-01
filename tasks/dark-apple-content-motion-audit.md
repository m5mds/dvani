# Dark Apple-Luxury Content And Motion Audit

## Scope

Implemented the approved direction: keep Divani's dark identity while making the copy, typography, and motion feel calmer, more exact, and more premium.

Source of truth remains `tasks/build-multipage-site.js`; all 10 HTML files and shared `assets/site.css` / `assets/site.js` were regenerated from it.

## Content Consistency

- Rewrote homepage copy around guest movement, material touch, readiness before opening, and operational clarity.
- Rewrote all page heroes so the nine required pages feel connected instead of template-like.
- Reworked project and service descriptions to sound more specific to hospitality, fit-out, furnishing, and commercial operation.
- Preserved the project proof structure and the client-logo strip.
- Kept client logos only in logo treatments, not as backgrounds.

## Visual And Motion Consistency

- Kept the dark Divani palette and restrained gold accents.
- Switched to a premium system font stack that prefers Apple Arabic / SF fonts when available, with local fallbacks.
- Reduced title scale across inner pages and mobile so headings no longer dominate the whole experience.
- Added soft page entrance, image settle, reveal, mobile drawer, card hover, and project-switch motion.
- Preserved reduced-motion support.
- Moved the mobile floating WhatsApp CTA to the lower-left so it no longer covers project titles.
- Hid the floating WhatsApp CTA on mobile quote/contact pages because those pages already contain direct WhatsApp actions.

## Verification

- `node --check tasks\build-multipage-site.js`: passed.
- `node --check assets\site.js`: passed.
- CSS scan for viewport-scaled font sizes, nonzero letter spacing, and CSS `url(...)`: no matches.
- Browser audit across all pages: 0 broken images, 0 missing alt attributes, 0 horizontal overflow, 0 unrevealed elements, 0 runtime errors.
- Mobile drawer: opens, `aria-hidden=false`, menu button is 46x46, focus lands on close button.
- Project switch: changes to `ليلاك بارك`, updates image to `assets/project-lica-clean.jpg`, and keeps only one active project.
- Quote form: generates a WhatsApp URL for `966531100366`.

## Screenshots

- `tasks/screenshots/dark-apple-home-desktop.png`
- `tasks/screenshots/dark-apple-home-mobile.png`
- `tasks/screenshots/dark-apple-projects-desktop.png`
- `tasks/screenshots/dark-apple-projects-mobile.png`
- `tasks/screenshots/dark-apple-clients-desktop.png`
- `tasks/screenshots/dark-apple-quote-mobile.png`

## Final Notes

The site now keeps the dark identity, uses cleaner content, has calmer page hierarchy, and adds Apple-like smoothness without redesigning the approved multi-page structure.
