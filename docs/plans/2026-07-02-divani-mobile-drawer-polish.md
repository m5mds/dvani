# Divani Mobile Drawer Polish

Goal: make the mobile navigation feel premium, calm, and intentional while preserving the existing multipage structure and dark Divani identity.

## Audit Notes

- The drawer is functional and accessible, but visually plain: flat black panel, text close mark, basic underlined links, and no premium hierarchy.
- On mobile, the drawer is one of the first interactive moments. If it feels generic, the Apple-like direction weakens even when the page sections are polished.
- The site already has enough visual weight, so the drawer should become quieter and more tactile rather than more decorative.

## Design Direction

- Keep the panel dark, narrow, edge-anchored, and right-aligned for Arabic reading flow.
- Replace the text close mark with a CSS-drawn control.
- Give nav items larger touch targets, subtle active states, and a controlled hover/focus response.
- Treat the quote CTA as the drawer's final action with full-width alignment.
- Add soft blur, shadow, and material depth without adding extra copy or imagery.

## Verification

- Regenerate all generated pages from `tasks/build-multipage-site.js`.
- Run the multipage browser audit for links, images, drawer behavior, project switching, overflow, forms, and console errors.
- Capture mobile drawer screenshots on at least the home and projects pages.
