# Cinematic Apple Luxury Pass Audit

## Direction

Implemented the approved `Cinematic Apple Luxury` direction: keep Divani dark and spatial, but make the experience feel more Apple-like through restraint, cleaner rhythm, stronger project proof, and quieter UI.

Design source: `docs/plans/2026-07-01-divani-cinematic-apple-luxury-design.md`.

## What Changed

- Reworked the homepage rhythm into clearer chapters: hero, quiet client proof, focused intro, product-style project reveal, service rows, and quote close.
- Converted the home intro into one centered statement with three proof lines instead of a split panel that felt more generic.
- Strengthened the home project proof with a larger, calmer project reveal and less card noise.
- Replaced the homepage service card grid with concise service rows, closer to an Apple-style spec/detail section.
- Slowed and softened the logo rail so it reads like ambient proof rather than a banner.
- Made the floating WhatsApp CTA a dark glass chip with a small green signal instead of a loud green pill.
- Kept all existing pages, project proof, forms, client logos, and clean-image rules intact.

## Verification

- Regenerated all 10 HTML files from `tasks/build-multipage-site.js`.
- `node --check tasks\build-multipage-site.js`: passed.
- `node --check assets\site.js`: passed.
- CSS scan for viewport font sizing, nonzero letter spacing, and CSS image URLs: no matches.
- Browser audit: 0 broken images, 0 missing alt attributes, 0 horizontal overflow, 0 unrevealed items, 0 runtime errors.
- Mobile drawer still opens with focus on close button and 46x46 menu button.
- Project switch still changes to `ليلاك بارك` and keeps one active project.
- Quote form still generates a WhatsApp URL for `966531100366`.

## Screenshots

- `tasks/screenshots/cinematic-apple-home-desktop.png`
- `tasks/screenshots/cinematic-apple-home-mobile.png`
- `tasks/screenshots/cinematic-apple-projects-desktop.png`
- `tasks/screenshots/cinematic-apple-projects-mobile.png`

## Notes

The result now feels more restrained and premium without turning Divani into a white tech page. The biggest visual improvement is the homepage rhythm: fewer competing cards, more negative space, and a stronger project-as-product reveal.
