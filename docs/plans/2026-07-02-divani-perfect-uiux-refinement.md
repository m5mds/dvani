# Divani Perfect UI/UX Refinement Pass

## Objective

Move the current dark Apple-like Divani site closer to a refined client-ready UI/UX without redesigning the approved multipage structure.

## Current Audit Findings

- Homepage direction is strong: dark identity, right-anchored hero copy, client proof strip, and quiet CTAs.
- Inner-page hero content needs stronger intentional placement on desktop; it should feel anchored, readable, and above the image shade at all viewport sizes.
- Project pages still carry the most conversion weight, but the showcase can feel like two separate panels rather than a unified product-style reveal.
- The floating WhatsApp chip creates visual clutter on mobile and can overlap premium proof content.

## Design Rules For This Pass

- Preserve the project showcase and existing multipage architecture.
- Keep the dark identity and Apple-like restraint.
- Do not introduce new image backgrounds, collages, or reused noisy imagery.
- Improve hierarchy, spacing, containment, and mobile clarity with CSS/system changes.
- Keep all changes in `tasks/build-multipage-site.js` first, then regenerate shared assets.

## Implementation Plan

- Right-anchor and lift inner-page hero content with explicit stacking above the shade.
- Refine the project showcase into a single composed surface with a larger visual stage and quieter control panel.
- Reduce mobile hero title pressure and remove the sticky WhatsApp overlay on mobile.
- Regenerate and audit all pages.

