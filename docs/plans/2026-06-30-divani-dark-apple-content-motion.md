# Divani Dark Apple-Luxury Content And Motion Pass

## Decision

Keep Divani's dark identity and improve the site through clearer brand copy, refined typography, and Apple-like motion discipline.

Apple-like means:

- restrained hierarchy,
- smooth pacing,
- system-level polish,
- content that feels simple but exact,
- subtle transitions that do not distract from the work.

It does not mean copying Apple's visual brand, using bright product-page minimalism, or abandoning the dark hospitality/interior-design direction.

## Content Direction

Rewrite copy so it sounds more like Divani:

- Arabic-first, composed, and confident.
- Focused on hospitality, commercial spaces, fit-out, furnishing, material discipline, and execution.
- Less template-like language.
- Less generic "we provide services" phrasing.
- Stronger page introductions that explain why each page matters.
- CTAs should feel direct and useful: start the project, request a quote, talk via WhatsApp.

## Typography Direction

- Preserve local/static deployment with no external font dependency.
- Use a premium system font stack that favors Apple platforms where available and high-quality Arabic fallbacks elsewhere.
- Reduce heavy inner-page title feeling.
- Use weight, spacing, and line-height for elegance rather than oversized headings.

## Motion Direction

- Add a soft page entrance.
- Use subtle reveal motion with opacity, small translation, and blur.
- Add refined image entrance/hover behavior.
- Make the mobile drawer and project transitions feel smoother.
- Respect `prefers-reduced-motion`.
- Avoid large parallax, gimmicks, or motion that makes the site feel chaotic.

## Implementation Notes

- Update `tasks/build-multipage-site.js` as the source of truth.
- Regenerate all static pages after generator changes.
- Keep `Divani (1).html` synced with `index.html`.
- Preserve all image-quality rules: no half logos, no dirty PDF-slide imagery, no client logos as backgrounds.
- Re-run browser and screenshot audits after changes.
