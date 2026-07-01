# Divani Multi-Page Website Design

## Decision

Build Divani as a refined multi-page corporate portfolio site, not a longer one-page site.

The current page has a strong visual direction: dark luxury palette, project-led proof, restrained typography, clean local assets, and a direct WhatsApp conversion path. The new required sitemap is broader than the current single-page structure, so the site should expand into separate pages while preserving the existing premium visual DNA.

## Required Pages

1. `index.html` - الرئيسية
2. `about.html` - من نحن
3. `why-us.html` - لماذا نحن
4. `services.html` - الخدمات
5. `projects.html` - المشاريع
6. `clients.html` - العملاء
7. `certificates.html` - الشهادات والاعتمادات
8. `quote.html` - طلب عرض سعر
9. `contact.html` - تواصل معنا

## Shared Design System

- Arabic-first RTL layout.
- Shared header, mobile drawer, footer, WhatsApp-first CTA, and restrained navigation.
- Dark architectural palette: black, warm bone, muted champagne, walnut accents.
- One disciplined grid system and consistent section gutters across pages.
- Section headings stay controlled; only the homepage hero gets large theatrical type.
- Images carry the premium emotion; copy stays short and useful.
- No external frameworks or CDNs. The site remains static and local.

## Non-Negotiable Image Rules

- Do not use any image with a half logo, cropped logo, cut-off branding, baked-in PDF text, slide artifacts, or accidental marks.
- Do not use client-logo images as project, hero, footer, or background atmosphere.
- Client logos belong only in intentional logo grids or marquees.
- Every image must be inspected at its actual crop before use.
- Prefer clean project crops already generated in `assets/` and reject any crop that looks like a broken screenshot.
- Avoid obvious visual reuse across major pages unless it is a deliberate brand signature image.

## Page Design

### Home

Purpose: premium first impression and gateway.

Content:
- Cinematic hero.
- Short company promise.
- Moving client/logo confidence strip.
- Featured project preview.
- Service preview.
- Quote and WhatsApp CTA.

### About

Purpose: explain who Divani is without sounding generic.

Content:
- Company overview.
- Interior design and fit-out positioning.
- Timeline or operating principles.
- Clean supporting image, no noisy PDF slide.

### Why Us

Purpose: turn "why Divani" into a clear decision argument.

Content:
- One accountable path.
- Design-to-execution clarity.
- Quality, coordination, material discipline, and delivery.
- Light proof blocks, not dense paragraphs.

### Services

Purpose: show the main service areas clearly.

Content:
- Interior design.
- Fit-out and finishing.
- Furniture/supply.
- Furnishing and styling.
- Project coordination.
- Each service gets short copy and, where useful, a clean detail image.

### Projects

Purpose: strongest proof page.

Content:
- Large project showcase/gallery.
- Six current clean project assets.
- Project metadata and short Arabic descriptions.
- No half-logo crops and no text-heavy PDF spreads.

### Clients

Purpose: show credibility.

Content:
- Clean client logo grid using `assets/client-logos/`.
- Optional moving strip reused carefully.
- No logo backgrounds, no cropped logo fragments.

### Certificates

Purpose: show trust and compliance.

Content:
- Certificates/accreditations area.
- If certificate source images are unavailable or poor quality, present a clean "available on request" credential layout rather than fake or broken certificate images.

### Quote

Purpose: primary lead capture.

Content:
- Request quote form with fields for name, phone, project type, location, timeline, service need, and message.
- WhatsApp alternative button.
- Static form behavior: use `mailto:` or client-side WhatsApp message generation unless backend details are provided.

### Contact

Purpose: direct conversion and company contact.

Content:
- WhatsApp, phone, location, profile download.
- Contact form.
- Clean Divani mark and architectural line treatment.

## Navigation

Desktop nav:
- الرئيسية
- من نحن
- لماذا نحن
- الخدمات
- المشاريع
- العملاء
- الشهادات
- طلب عرض سعر
- تواصل معنا

Mobile nav:
- Same order in drawer.
- Drawer must trap focus, close on Escape, and close after selecting a link.

## Interactions

- Preserve lightweight reveal motion.
- Preserve reduced-motion handling.
- Preserve direct WhatsApp actions.
- Project gallery can use simple accessible filtering or project selection.
- Forms should be usable in a static file context.

## Verification

Before completion:

- Open every page in browser automation.
- Confirm all local links resolve.
- Confirm all referenced assets exist and load.
- Confirm no horizontal overflow on desktop or mobile.
- Confirm mobile nav works on every page.
- Confirm quote/contact forms are visible, usable, and do not break layout.
- Confirm images are visually clean and do not contain half logos or slide artifacts.
- Capture desktop and mobile screenshots for representative pages.

## Recommendation

Proceed with a controlled multi-page rebuild using the current design language as the base. Do not restart the art direction from scratch. The work is to expand the information architecture, clean up navigation, enforce image discipline, and make each required page feel intentional rather than bolted onto the existing one-page site.
