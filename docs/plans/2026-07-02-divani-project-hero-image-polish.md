# Divani Project Hero Image Polish

Goal: remove obvious image reuse and text-heavy background pressure from the projects page hero while preserving the existing project showcase.

## Audit Notes

- `projects.html` currently uses `assets/project-auditorium-clean.jpg` for both the page hero and the first interactive project image.
- The auditorium image contains a visible blue screen with embedded content, which is acceptable as project proof but weak as atmospheric hero background.
- `assets/detail-lobby-lines.jpg` is a cleaner, unused architectural image with no visible client logo, half mark, or baked-in text in the inspected crop.

## Design Direction

- Use `assets/detail-lobby-lines.jpg` as the projects page hero image.
- Keep the interactive project showcase unchanged.
- Regenerate all pages from `tasks/build-multipage-site.js` so source and output stay aligned.

## Verification

- Confirm the old hero duplicate is removed from `projects.html`.
- Run the multipage browser audit.
- Capture and inspect the updated projects page screenshot.
