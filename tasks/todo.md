# Divani Insane Overhaul Plan

## Creative Brief

Make the page feel like a premium Arabic interior design / fit-out dossier, not a generic landing page. The first screen should feel cinematic and specific to Divani: project imagery becomes the interface, materials and measurements become graphic texture, and the content reads like a confident studio presentation for a serious client.

## Implementation Checklist

- [x] Capture the correction and define a stronger non-generic direction.
- [x] Audit the current HTML/CSS structure and reusable image assets.
- [x] Rebuild the page composition around an editorial visual system.
- [x] Add distinctive interactions/motion that remain lightweight in static HTML.
- [x] Replace generic sections with project-led proof, capabilities, and contact flow.
- [x] Verify desktop and mobile screenshots, broken assets, console errors, and horizontal overflow.
- [x] Document the completed changes and verification notes here.

## Design Principles

- Use asymmetric, full-bleed visual moments instead of centered template blocks.
- Make existing PDF-derived images dominate the design, not merely decorate it.
- Keep Arabic RTL hierarchy intentional, readable, and premium.
- Avoid fake social proof, stock copy, and generic SaaS-style cards.
- Keep the page static and self-contained except for local assets.

## Review

Completed the full visual overhaul of `Divani (1).html`.

- Rebuilt the page as a cinematic Divani atelier dossier instead of a generic hero/services/gallery layout.
- Extracted the inline logo into `assets/divani-logo.png` and removed external Google Fonts so the page runs cleanly as a static local file.
- Added a sculptural rattan hero, project-command selector, project ledger, scope matrix, real image-cropped material board, site-to-handover process, and stronger contact close.
- Verified in Microsoft Edge via Playwright at 1440x1000 and 390x844: no broken images, no console errors, no horizontal overflow.
- Verified interactions: mobile drawer opens and locks the page; project selector switches to the Red Sea detail case and keeps one active item.
- Current screenshots: `tasks/screenshots/desktop-overhaul.png`, `tasks/screenshots/mobile-overhaul.png`, and `tasks/screenshots/mobile-menu-overhaul.png`.

## Visual Enhancement Pass

Constraint: enhance the existing dossier concept only. Do not redesign the information architecture, section order, or core composition.

- [x] Audit existing CSS/JS hooks for safe enhancement points.
- [x] Add atmospheric visual depth without changing layout.
- [x] Improve image/project presentation micro-interactions.
- [x] Add subtle section-level polish and motion that respects reduced-motion.
- [x] Verify desktop/mobile screenshots, broken assets, console errors, overflow, and key interactions.
- [x] Document final enhancement notes here.

Enhancement notes:

- Added pointer-driven ambient light, subtle hero lattice overlays, richer image depth, and button shimmer.
- Added hover polish to proof rows, capability lanes, scope cells, project rows, ledger rows, material swatches, process steps, and contact rows.
- Added project image sweep animation on case-study switching while preserving reduced-motion support.
- Verified in Microsoft Edge via Playwright at 1440x1000 and 390x844: no broken images, no console errors, no horizontal overflow.
- Verified interactions: mobile drawer opens and locks page; project selector switches to the Red Sea detail case and keeps one active item.
- Current screenshots: `tasks/screenshots/desktop-enhanced.png`, `tasks/screenshots/mobile-enhanced.png`, and `tasks/screenshots/mobile-menu-enhanced.png`.

## Whole-File Clarity And Bug Audit

Goal: reduce content pressure for a client who has never done an interior design project, while keeping the strong visual direction and fixing brittle or broken behavior.

- [x] Read the full HTML/CSS/JS and map every section, interaction, and CTA.
- [x] Browser-audit the current page across first screen, mid page, project selector, mobile drawer, and contact.
- [x] Identify content blocks that repeat, over-explain, or use too much industry language.
- [x] Fix broken/brittle features and improve accessibility/focus behavior.
- [x] Simplify the visitor path without making the site generic.
- [x] Verify desktop/mobile screenshots, console, assets, overflow, and interactions.
- [x] Document final clarity and bug-fix results here.

Clarity and bug-fix notes:

- Reduced visible copy from 3613 to 2894 characters and removed repeated proof density.
- Replaced the 8-cell technical scope matrix with a simple 3-step beginner path: send the space, define direction, organize execution.
- Replaced the dense project ledger with a short explanatory note and shortened project descriptions.
- Renamed navigation from "القدرات" to "الخدمات" for clearer client language.
- Rewrote hero/process/contact copy for first-time interior design clients.
- Added focus-visible styling and fixed section anchor offsets under the fixed header.
- Fixed hidden mobile drawer focusability using `inert`, moved focus into the drawer on open, trapped tab focus, and returned focus on close.
- Added `aria-pressed` state to project buttons, `aria-live` to the project caption, and fixed rapid project-switch timer races.
- Verified in Microsoft Edge via Playwright at 1440x1000 and 390x844: no broken images, no console errors, no horizontal overflow.
- Verified interactions: mobile drawer opens with focus on the close button, tab stays inside the drawer, and project selector switches to the Red Sea detail case with one active item.
- Current screenshots: `tasks/screenshots/desktop-clarity.png`, `tasks/screenshots/mobile-clarity.png`, and `tasks/screenshots/mobile-menu-clarity.png`.

## Beauty Pass

Goal: make the site feel more beautiful and client-impressive without adding content density back.

- [x] Audit current screenshots for flatness, weak visual hierarchy, and underused image assets.
- [x] Add richer material/image treatment and stronger section transitions.
- [x] Improve typographic and interactive polish without changing the core flow.
- [x] Verify desktop/mobile screenshots, console, assets, overflow, and interactions.
- [x] Document final beauty-pass results here.

Beauty-pass notes:

- Generated focused detail crops from the existing project imagery: rattan, lobby lines, ceiling, auditorium wood, and map-suite texture.
- Added section-level visual anchors so the page feels designed past the hero: editorial divider rules, large quiet chapter words, stronger cream-section photo texture, and richer dark-section depth.
- Upgraded the materials board to use real project-detail crops instead of generic fills.
- Added a scroll-progress accent and refined hover/image treatment while keeping the existing layout and content flow.
- Hardened reveal animations so content remains visible if JavaScript is disabled or the observer misses an element; all 23 reveal elements now resolve visible after page settle.
- Verified in Microsoft Edge via Playwright at 1440x1000 and 390x844: no broken images, no console errors, no page errors, no horizontal overflow.
- Verified interactions: mobile drawer opens with focus on the close button, tab stays inside the drawer, and project selector switches to the Red Sea detail case with one active item.
- Current screenshots: `tasks/screenshots/desktop-beauty.png`, `tasks/screenshots/mobile-beauty.png`, and `tasks/screenshots/mobile-menu-beauty.png`.

## Senior UI/UX Audit

Goal: stop incremental visual polishing and define the stronger art direction the site actually needs.

- [x] Record the correction and change the working mode from implementation to design audit.
- [x] Review current desktop/mobile screenshots for emotional weakness and visual hierarchy problems.
- [x] Sample the original PDF profile to identify native brand/project cues.
- [x] Compare against current interior-design portfolio patterns: image-first, restrained navigation, and project-led storytelling.
- [x] Produce a concrete visual direction and implementation plan before touching the site again.

Audit result:

- The current site is over-styled but under-directed: it has many treatments, yet the work does not feel like the central luxury object.
- The next pass should be a conceptual rebuild of the presentation language, not another layer of effects.
- Recommended direction: cinematic lookbook / spatial portfolio, led by large project photography, severe typography, fewer panels, and a restrained premium palette.
- Full audit/proposal: `tasks/uiux-audit.md`.

## $10k Cinematic Rebuild

Goal: rebuild the live HTML into a premium cinematic portfolio that can carry a serious client pitch.

- [x] Mine the PDF and local assets for the strongest project imagery.
- [x] Replace the current UI-heavy page with an image-led lookbook structure.
- [x] Build a seductive desktop and mobile rhythm: full-bleed hero, project runway, tactile material moments, quiet proof, and direct WhatsApp close.
- [x] Keep the page static, fast, Arabic-first, and locally self-contained.
- [x] Verify screenshots, console, assets, overflow, mobile menu, project interactions, and contact links.
- [x] Document the final rebuild result here.

Rebuild notes:

- Extracted 1650px-wide project spreads from the PDF and generated named lookbook assets for Red Sea, Royal Auditorium, Hayyak, Lica Park, House Express, Marvellous Hotel, Swiss in Tabuk, and detail crops.
- Rebuilt `Divani (1).html` as a cinematic spatial lookbook: signature hero, editorial philosophy section, project runway, selected-frame mosaic, material language section, quiet capability proof, and private-start contact close.
- Removed the previous UI-heavy feel: fewer boxes, fewer counters, fewer decorative labels, larger photography, stronger visual rhythm.
- Kept it static and local: no external fonts, no CDNs, no framework, no base64 bloat.
- Verified in Microsoft Edge via Playwright at 1440x1000 and 390x844: no broken images, no bad local links, no console errors, no page errors, no horizontal overflow.
- Verified interactions: mobile drawer opens with focus on the close button, tab stays inside the drawer, all 17 reveal elements become visible, and the project runway switches to Lica Park with one active item.
- Current screenshots: `tasks/screenshots/desktop-10000.png`, `tasks/screenshots/mobile-10000.png`, and `tasks/screenshots/mobile-menu-10000.png`.

## Post-Rebuild Audit

Goal: audit the new cinematic rebuild before doing another implementation pass.

- [x] Review desktop and mobile full-page screenshots for visual rhythm and hierarchy.
- [x] Check live page metrics, section heights, first-fold CTA visibility, touch targets, images, and accessibility risks.
- [x] Identify remaining issues by priority.

Audit notes:

- The direction is significantly stronger: image-led, cinematic, less UI-heavy, and closer to a premium interior portfolio.
- Biggest remaining issue is mobile pacing: the page is over 10,000px tall and the gallery/material sections stack into a long image column.
- Hero and project runway are the strongest parts; proof/contact are clear but less seductive.
- Several intentionally visual images use empty alt text even when they communicate project evidence; this is acceptable only for purely decorative background imagery, not for gallery/material content.
- Recommended next pass: mobile compression, stronger hero crop/contrast, localized Arabic project titles, alt text cleanup, and slightly more luxurious contact/proof sections.

## Client-Ready Tightening Pass

Goal: act on the post-rebuild audit and make the cinematic site sharper for a serious client presentation.

- [x] Create/choose a cleaner hero crop that does not fight the Arabic headline.
- [x] Compress mobile pacing so the page feels curated instead of endlessly stacked.
- [x] Localize project runway titles into Arabic while keeping client names as metadata.
- [x] Add meaningful alt text to content images and keep only decorative images empty.
- [x] Make proof and contact sections feel more premium without restoring visual clutter.
- [x] Verify screenshots, console, links, assets, overflow, mobile drawer, and project runway behavior.
- [x] Document final tightening results here.

Tightening notes:

- Created `assets/look-hero-clean.jpg` from the cleaner rattan source so the first-screen headline no longer fights the baked-in Red Sea logo text.
- Localized project runway display titles into Arabic while preserving client names in small metadata codes.
- Reduced mobile scroll height from about 10,219px to 7,767px by tightening section spacing, limiting mobile gallery exposure, and making material tiles denser.
- Added alt text to all content gallery/material images; decorative hero/opening/stage images remain empty and hidden from assistive tech.
- Gave proof and contact sections more premium image-backed depth without returning to a card-heavy layout.
- Verified in Microsoft Edge via Playwright at 1440x1000 and 390x844: no broken images, no bad local links, no console errors, no page errors, no horizontal overflow, no undersized visible targets, and all 17 reveal elements visible.
- Verified interactions: mobile drawer opens with focus on close, tab moves into drawer links, menu button is 46x46 on mobile, and project runway switches to Lica Park with one active item.
- Current screenshots: `tasks/screenshots/desktop-tightened.png`, `tasks/screenshots/mobile-tightened.png`, and `tasks/screenshots/mobile-menu-tightened.png`.

## Calm Gallery Pass

Goal: preserve the visual-first cinematic direction while removing the chaotic collage feeling.

- [x] Replace overlapping/collage image groups with calmer single-image or three-image compositions.
- [x] Make the project runway feel like a controlled gallery feature instead of a busy full-background scene.
- [x] Reduce mobile visual stacking and keep only the strongest image beats.
- [x] Verify screenshots, console, assets, overflow, drawer, and project switching.
- [x] Document final calm-gallery results here.

Calm-gallery notes:

- Reduced the opening philosophy section from three overlapping posters to one dominant atmospheric frame.
- Converted the project runway from a full-background collage into a controlled framed project feature with the image and copy separated.
- Reduced selected frames from five competing images to three stronger proof images.
- Reduced material cues from four image cards to three quieter bands.
- Verified in Microsoft Edge via Playwright at 1440x1000 and 390x844: no broken images, no bad local links, no console errors, no page errors, no horizontal overflow, no undersized visible targets, and all 15 reveal elements visible.
- Verified interactions: mobile drawer opens with focus on close, tab moves into drawer links, menu button remains 46x46, and project runway switches to Lica Park with one active item.
- Current screenshots: `tasks/screenshots/desktop-calm.png`, `tasks/screenshots/mobile-calm.png`, and `tasks/screenshots/mobile-menu-calm.png`.

## Elegance Re-Audit

Goal: stop implementation and re-audit the whole site for elegance, hierarchy, clean imagery, and visual discipline.

- [x] Audit current screenshots for title scale, image noise, background misuse, and repeated assets.
- [x] Audit HTML/CSS for typography scale, image references, and background image usage.
- [x] Define strict design rules before any next implementation.
- [x] Document findings in a dedicated audit file.

Elegance re-audit notes:

- The current direction is strategically closer, but the execution is still not distinguished because title scale, image reuse, and noisy source imagery are uncontrolled.
- Key failure: images with baked-in client logos/text are used as atmosphere/background, especially contact/footer.
- Key failure: every heading is oversized, so the page has no quiet hierarchy.
- Key rule for next implementation: use project images as framed proof, not wallpaper, unless they are clean and logo-free.
- Full audit: `tasks/elegance-reaudit.md`.

## Quiet Architectural Magic Pass

Goal: implement the elegance reset: restrained typography, clean source imagery, no client-logo backgrounds, no obvious photo reuse, and a distinguished premium portfolio rhythm.

- [x] Triage assets and create clean logo/text-free crops for web use.
- [x] Rebuild the page structure into a quieter architectural portfolio.
- [x] Reduce title scale and enforce one hero-scale type moment only.
- [x] Remove noisy background photos and client-branded contact/footer imagery.
- [x] Avoid obvious reuse of the same project image across major sections.
- [x] Verify desktop/mobile screenshots, console, links, assets, overflow, drawer, and contact actions.
- [x] Document final magic-pass results here.

Magic-pass notes:

- Created clean `magic-*` web crops and rebuilt the page around those instead of noisy PDF spreads.
- Removed all CSS project-photo background URLs; only the clean hero uses a project image as an atmospheric first screen.
- Rebuilt the structure to six calm sections: hero, studio, selected work, details, capability, contact.
- Reduced title scale: desktop h1 is about 100px, desktop h2 about 65px, mobile h1 about 59px, mobile h2 about 35px.
- Removed the project runway/filmstrip and any client-branded contact/footer background.
- Ensured each project/detail image is used once; only the Divani logo repeats.
- Verified in Microsoft Edge via Playwright at 1440x1000 and 390x844: no broken images, no bad local links, no console errors, no page errors, no horizontal overflow, no undersized visible targets, all 14 reveal elements visible, and all informative images have alt text.
- Verified mobile drawer: opens with focus on close, traps tab movement into drawer links, and uses a 46x46 menu button.
- Current screenshots: `tasks/screenshots/desktop-magic.png`, `tasks/screenshots/mobile-magic.png`, and `tasks/screenshots/mobile-menu-magic.png`.

## Full Senior Audit After Project Showcase Regression

Goal: audit the current quiet build, restore the value of the removed project showcase, and identify the alignment and hierarchy failures before any new implementation.

- [x] Record the correction that the project showcase should not have been removed.
- [x] Audit current screenshots and section structure.
- [x] Identify missing project-showcase value, misalignments, and weak sections.
- [x] Write the senior audit with next implementation rules.

Audit result:

- The latest quiet build fixed noisy image/background problems, but removed the strongest conversion proof: the project showcase/runway.
- The current `Selected Work` section is only three static cards, so the portfolio feels flatter and less inspectable.
- The surrounding sections still have alignment and hierarchy issues: each section uses a different grid rhythm, headings still dominate through tight line breaks, and the cream/detail section reads like a separate slide.
- Next implementation must restore a refined project showcase immediately after the hero, then simplify/merge the supporting sections around it.
- Full audit: `tasks/project-showcase-senior-audit.md`.

## Elegant Project-Led Finish Pass

Goal: finish the site end to end with an elegant project-led structure, restore the showcase, reduce chaos, and audit consistency after each structural add/delete.

- [x] Record the correction and consistency-audit requirement.
- [x] Inspect current source, assets, and live screenshot constraints.
- [x] Restore an elegant project showcase as the core proof section.
- [x] Simplify or merge weak supporting sections without losing clarity.
- [x] Audit additions/deletions for nav, hierarchy, image reuse, alignment, mobile flow, and conversion consistency.
- [x] Verify browser rendering, screenshots, links, console, assets, overflow, mobile drawer, and project switching.
- [x] Document final results and remaining risks.

Finish-pass notes:

- Rebuilt `Divani (1).html` into a tighter sequence: hero, restored project showcase, capability, material detail proof, and contact.
- Restored a real browsable project showcase with six projects, active states, project metadata, and image/title/description switching.
- Generated clean project crops and removed the unused Red Sea crop to avoid repeating the hero rattan image in the showcase.
- Removed the weak static-only project grid and the extra studio section from the main flow so projects appear immediately after the hero.
- Fixed audit-found mobile menu width regression: final button size is 46x46.
- Tightened mobile hero spacing and swapped the material-section image mix after visual review.
- Verified with Chrome headless: no broken images, no missing anchors, no horizontal overflow, no runtime errors, project switch works, mobile drawer opens correctly, and all reveal items resolve visible.
- Final screenshots: `tasks/screenshots/desktop-elegant.png`, `tasks/screenshots/mobile-elegant.png`, and `tasks/screenshots/mobile-menu-elegant.png`.
- Consistency audit: `tasks/elegant-consistency-audit.md`.

## Visual Elevation Pass

Goal: elevate the current elegant project-led build visually without redesigning the information architecture or weakening the restored project showcase.

- [x] Record the visual elevation task.
- [x] Audit current screenshots for flatness, weak hierarchy, and missed premium moments.
- [x] Add scoped visual enhancements to hero, project showcase, material proof, and contact.
- [x] Run consistency audit for anchors, image use, title scale, mobile flow, and conversion path.
- [x] Verify browser screenshots, assets, links, overflow, drawer, and project switching.
- [x] Document final visual elevation result.

Elevation notes:

- Added restrained premium depth: hero frame, richer image treatment, CTA shimmer, section light rails, project-stage gallery frame, active project glow, capability surface polish, material-card depth, and contact line grid.
- Preserved the current structure and restored showcase; no new content-heavy sections and no redesign.
- Verified with Chrome headless using `AUDIT_SUFFIX=elevated`: no broken images, no missing anchors, no horizontal overflow, no runtime errors, project switch works, mobile drawer opens correctly, and all reveal items resolve visible.
- Final screenshots: `tasks/screenshots/desktop-elevated.png`, `tasks/screenshots/mobile-elevated.png`, and `tasks/screenshots/mobile-menu-elevated.png`.
- Consistency audit: `tasks/visual-elevation-audit.md`.

## Served-By Logo Strip Pass

Goal: review the Divani profile again and add a tasteful moving "Proud to have served" logo strip under the hero section using companies from the profile.

- [x] Record the logo-strip task.
- [x] Review the PDF profile for served/client company logos.
- [x] Extract or recreate clean web-ready logo assets.
- [x] Add the moving strip directly under the hero without disrupting the project-led structure.
- [x] Audit consistency for image use, motion, mobile flow, anchors, and conversion path.
- [x] Verify browser screenshots, links, assets, overflow, drawer, and project switching.
- [x] Document final result.

Served-strip notes:

- Re-reviewed the Divani profile and used the clean client-logo spreads from pages 7-10.
- Generated web-ready client logo assets under `assets/client-logos`.
- Added a moving "Proud to have served" logo strip directly between the hero and project showcase.
- Fixed final QA issues with RTL marquee alignment and default figure margins so logos remain visible and dense on mobile.
- Preserved reduced-motion support, project switching, mobile drawer behavior, and the existing conversion path.
- Verified with Chrome headless using `AUDIT_SUFFIX=served`: no broken images, no missing anchors, no horizontal overflow, no runtime errors, and no unrevealed content.
- Final audit: `tasks/served-logo-strip-audit.md`.

## Multi-Page Divani Website Build

Goal: expand Divani from the current elegant one-page portfolio into the approved multi-page corporate website while preserving the premium visual language and enforcing strict clean-image rules.

Design source: `docs/plans/2026-06-29-divani-multipage-design.md`.

- [x] Capture the user correction about broken/half-logo imagery.
- [x] Save the approved multi-page design direction.
- [x] Audit existing assets and choose only clean page-ready images.
- [x] Create shared multi-page CSS/JS shell with header, mobile drawer, footer, CTAs, and forms.
- [x] Build `index.html` for الرئيسية.
- [x] Build `about.html` for من نحن.
- [x] Build `why-us.html` for لماذا نحن.
- [x] Build `services.html` for الخدمات.
- [x] Build `projects.html` for المشاريع.
- [x] Build `clients.html` for العملاء.
- [x] Build `certificates.html` for الشهادات والاعتمادات.
- [x] Build `quote.html` for طلب عرض سعر.
- [x] Build `contact.html` for تواصل معنا.
- [x] Verify all local page links, assets, nav states, mobile drawer behavior, WhatsApp links, forms, overflow, and console errors.
- [x] Visually inspect screenshots for image cleanliness and reject any half-logo or PDF-slide artifact.
- [x] Document the final consistency audit and screenshots.

Multipage build notes:

- Created the approved 9-page static site and kept `Divani (1).html` as a homepage-compatible entry.
- Added shared assets: `assets/site.css`, `assets/site.js`, and cropped certificate assets under `assets/certificates`.
- Added `tasks/build-multipage-site.js` for reproducible static generation.
- Reused only inspected clean project/detail imagery and intentional client-logo/certificate crops.
- Reduced inner-page heading scale after screenshot review; only the homepage keeps the large brand hero.
- Reduced the mobile floating WhatsApp CTA after screenshot review so it does not cover content.
- Final browser audit: `tasks/browser-audit-multipage.json`.
- Final consistency audit: `tasks/multipage-consistency-audit.md`.

## Dark Apple-Luxury Content And Motion Pass

Goal: keep the dark Divani identity while refining content, typography, and transitions so the site feels more brand-aligned, premium, and Apple-like in restraint.

Design source: `docs/plans/2026-06-30-divani-dark-apple-content-motion.md`.

- [x] Capture the approved direction: dark identity, Apple-like restraint, better Divani voice.
- [x] Rewrite page copy in the generator so the whole site is consistent.
- [x] Refine typography with a premium system font stack and calmer hierarchy.
- [x] Add smoother page/reveal/image/drawer/project transitions while respecting reduced motion.
- [x] Regenerate all HTML pages from `tasks/build-multipage-site.js`.
- [x] Run browser audit for links, images, overflow, forms, drawer, project switching, and errors.
- [x] Capture and visually inspect representative screenshots.
- [x] Document the final consistency audit.

Dark Apple-Luxury notes:

- Rewrote homepage, inner-page hero, service, and project copy so the voice is more Divani: Arabic-first, tactile, operationally credible, and less generic.
- Kept the dark identity and added Apple-like restraint through a premium system font stack, calmer heading scale, smoother reveal/image/drawer/project transitions, and reduced-motion support.
- Preserved the multi-page structure, project showcase, client logo strip, clean image rules, quote form, contact form, and direct WhatsApp paths.
- Moved the floating WhatsApp CTA away from mobile project text and hid it on mobile quote/contact pages where inline WhatsApp actions already exist.
- Final browser audit is clean: 0 broken images, 0 missing alt attributes, 0 horizontal overflow, 0 unrevealed elements, 0 runtime errors.
- Final screenshots: `tasks/screenshots/dark-apple-home-desktop.png`, `tasks/screenshots/dark-apple-home-mobile.png`, `tasks/screenshots/dark-apple-projects-desktop.png`, `tasks/screenshots/dark-apple-projects-mobile.png`, `tasks/screenshots/dark-apple-clients-desktop.png`, `tasks/screenshots/dark-apple-quote-mobile.png`.
- Final consistency audit: `tasks/dark-apple-content-motion-audit.md`.

## Hero Alignment And Copy Cleanup

Goal: fix awkward Arabic phrasing and make the landing hero feel intentionally composed instead of centered like a generic template.

- [x] Record the correction in lessons.
- [x] Rewrite awkward hero/CTA lines with more natural Arabic.
- [x] Re-anchor the homepage hero copy away from the visual center.
- [x] Regenerate all static pages from the generator.
- [x] Run browser audit and inspect updated screenshots.
- [x] Document the final cleanup.

Hero/copy cleanup notes:

- Homepage hero is now physically right-anchored on desktop instead of sitting in the visual center.
- Hero label is Arabic-first: `تصميم داخلي / تنفيذ / تأثيث`.
- Rewrote awkward lines across home, about, why-us, services, projects, clients, certificates, quote, and contact.
- Verified updated desktop and mobile home screenshots: `tasks/screenshots/text-cleanup-home-desktop.png`, `tasks/screenshots/text-cleanup-home-mobile.png`.
- Browser audit remains clean after the cleanup.
- Final cleanup audit: `tasks/hero-copy-cleanup-audit.md`.

## Cinematic Apple Luxury Pass

Goal: make the existing Divani multipage site feel Apple-like through cinematic restraint, stronger project reveal, quieter proof, cleaner section rhythm, and smoother motion without abandoning the dark identity.

Design source: `docs/plans/2026-07-01-divani-cinematic-apple-luxury-design.md`.

- [x] Save approved design direction.
- [x] Audit generator structure for safe visual-system changes.
- [x] Refine hero/trust rail so the first viewport feels less like a template.
- [x] Convert the home project proof into a stronger product-style reveal.
- [x] Reduce card noise in services/supporting sections.
- [x] Tune motion, spacing, and mobile rhythm.
- [x] Regenerate all static pages.
- [x] Run browser audit and inspect screenshots.
- [x] Document final result.

Cinematic Apple Luxury notes:

- Reworked the homepage rhythm into a quieter chapter flow: hero, client proof rail, focused intro, project-as-product reveal, service rows, and quote close.
- Reduced visual card noise on the homepage by replacing the service grid with refined rows.
- Made the client logo strip slower and less banner-like.
- Increased the project reveal's visual importance while preserving clean image use.
- Replaced the loud green floating WhatsApp pill with a quieter dark glass chip.
- Browser audit remains clean: 0 broken images, 0 missing alt attributes, 0 horizontal overflow, 0 unrevealed items, 0 runtime errors.
- Final screenshots: `tasks/screenshots/cinematic-apple-home-desktop.png`, `tasks/screenshots/cinematic-apple-home-mobile.png`, `tasks/screenshots/cinematic-apple-projects-desktop.png`, `tasks/screenshots/cinematic-apple-projects-mobile.png`.
- Final audit: `tasks/cinematic-apple-luxury-audit.md`.

## GitHub Push

Goal: push the current Divani static site to `https://github.com/m5mds/dvani.git`.

- [x] Inspect repository state and remote.
- [x] Add ignore rules for generated screenshots, browser profiles, and audit JSON.
- [x] Initialize git repository and configure remote.
- [x] Commit the clean site files.
- [x] Push to GitHub.
- [x] Verify remote branch state.

## Apple-Like Page And Project Transitions

Goal: make the static Divani site feel like using an Apple product by adding native-feeling transitions between pages and project states.

Design source: `docs/plans/2026-07-01-divani-apple-transitions-design.md`.

- [x] Capture approved transition direction.
- [x] Add cross-document View Transition CSS for multipage navigation.
- [x] Add same-document View Transition support for project switching.
- [x] Add safe fallback page-exit animation for unsupported browsers.
- [x] Regenerate all static pages from the generator.
- [x] Run browser audit for links, images, overflow, forms, drawer, project switching, and errors.
- [x] Capture representative screenshots.
- [ ] Commit and push to GitHub.

Apple-like transition notes:

- Added native View Transition CSS for page navigation and shared elements.
- Added project image/text transitions with image preloading and a safe fallback.
- Fixed a Chromium edge case by temporarily removing the full-page transition capture during project switching.
- Final audit: `tasks/apple-transitions-audit.md`.
