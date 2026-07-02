# Divani Certificate Vault Polish

Goal: make the certificates page preserve document credibility while staying aligned with the dark luxury identity.

## Audit Notes

- The current certificates page drops into a broad beige paper section after the dark hero.
- The certificates are important proof, but the beige field and generic document cards feel disconnected from the rest of the refined site.
- Document scans must remain readable; the improvement should frame them better, not obscure them.

## Design Direction

- Replace the paper-section treatment with a dark certificate vault section.
- Add a calm trust heading before the certificate grid.
- Keep each certificate as an individual document card with readable previews.
- Use subtle dark material, fine borders, and gold numbering instead of a light paper wall.

## Verification

- Regenerate all generated pages from `tasks/build-multipage-site.js`.
- Run the multipage browser audit.
- Capture desktop and mobile screenshots of the certificates page.
