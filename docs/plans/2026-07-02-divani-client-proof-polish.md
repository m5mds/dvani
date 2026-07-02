# Divani Client Proof Polish

Goal: make client proof feel curated and premium instead of repetitive or box-heavy.

## Audit Notes

- The homepage logo strip is useful, but the current boxed logo tiles feel too grid-like for the luxury direction.
- The dedicated clients page repeats the moving strip immediately before a second logo grid, which makes the first viewport feel redundant.
- The client logo cards include visible captions even when many logos already include readable wordmarks, adding visual clutter.

## Design Direction

- Keep the moving logo strip on the homepage as the "proud to have served" moment.
- Remove the duplicate moving strip from the dedicated clients page and replace it with a calm client wall section.
- Make the logo wall feel curated: fewer hard boxes, better spacing, subtle material depth, hidden captions for visual quiet, and accessible logo alt text preserved.
- Keep the dark identity and avoid adding new imagery or extra marketing copy.

## Verification

- Regenerate every generated HTML file from `tasks/build-multipage-site.js`.
- Run the multipage browser audit.
- Capture the clients page and homepage logo strip after the change.
