# Divani Form UX Polish

## Objective

Continue the perfect UI/UX goal by making the quote and contact forms feel as refined and intentional as the visual portfolio pages.

## Current Evidence

- Quote/contact forms already submit to WhatsApp and include required name/phone fields.
- Form fields are functional, but the interaction states are visually quiet compared with the rest of the premium UI.
- Mobile form controls can feel dense unless the tap height, focus feedback, and invalid states are more deliberate.

## Design Rules

- Do not add content-heavy instructions.
- Preserve the static WhatsApp submission model.
- Improve tactile quality through control sizing, focus states, placeholder treatment, and invalid state styling.
- Keep the dark identity and reduced-motion discipline.

## Implementation Plan

- Add explicit telephone input types and basic length guidance.
- Improve form surface depth and control states in shared CSS.
- Add clear `:focus-within` and invalid-field styling.
- Replace default English browser validation text with Arabic custom validation messages.
- Regenerate, audit, screenshot, document, commit, and push.
