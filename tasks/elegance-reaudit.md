# Divani Whole-Site Elegance Re-Audit

## Executive Read

The current site is closer to the right strategic direction than the early versions: less copy, more visual proof, darker cinematic tone. But it still does not feel elegant enough because the visual system is too loud and too contaminated by source-image noise.

The main problem is no longer "too much content." The main problem is **uncontrolled emphasis**.

Everything is trying to be the moment:

- Giant titles.
- Dark backgrounds.
- Big photos.
- Embedded logos inside photos.
- Text baked into portfolio spreads.
- Repeated Red Sea/rattan imagery.
- Thumbnail filmstrip plus staged image plus gallery proof.
- Contact/footer using a client-branded image.

That makes the page feel dramatic, but not distinguished.

## Hard Diagnosis

### 1. Titles Are Too Huge

Current title scales:

- `h1`: `clamp(4.5rem,11vw,11.5rem)`
- `h2`: `clamp(2.8rem,7vw,7rem)`
- project title: `clamp(3rem,7vw,8rem)`
- contact title: `clamp(4rem,9vw,10rem)`
- mobile h2: `clamp(2.35rem,12vw,4.2rem)`

This is too much. The typography is performing luxury instead of expressing it.

Luxury does not need every heading to shout. The page needs one hero-scale title, then calm editorial headings.

### 2. Background Images Are Doing The Wrong Job

Some backgrounds contain client logos or embedded text:

- `look-lica-park.jpg` is used in contact background and includes a client logo.
- `look-redsea-rattan.jpg` appears in project feature and includes Red Sea Global branding.
- Several PDF spread images contain baked-in logo/text overlays.

Using those as atmospheric backgrounds makes the site feel like screenshots from a PDF rather than a custom web experience.

Rule: **No image with baked-in text/client logos should be used as a background, hero, or atmosphere layer.**

Such images can appear only as explicit portfolio proof, framed and captioned, where the embedded branding is expected.

### 3. Photo Reuse Is Too High

Repeated image references:

- `look-lica-park.jpg`: 3 uses.
- `look-redsea-rattan.jpg`: 3 uses.
- `look-hero-rattan-tight.jpg`: 3 uses.
- several project images: 2 uses.

This makes the site feel assembled from a small pile of assets instead of curated.

Rule: one image should not carry multiple major sections unless it is intentionally the brand's signature image. Even then, reuse must be disguised through clean crops and different roles.

### 4. The Footer/Contact Background Feels Wrong

The contact section should feel like a private invitation. Instead, the current background includes a client logo/portfolio-spread feel.

This is especially damaging because the contact section is the conversion moment. It should be clean, warm, and controlled.

Better direction:

- Use a clean interior texture.
- Or no photo at all: black field, subtle material gradient, Divani logo, direct CTA.
- Never use a client-branded portfolio spread behind contact.

### 5. The Page Still Has Too Many Visual Systems

Current systems include:

- Cinematic hero.
- Proof stats card.
- Single poster image.
- Framed project feature.
- Filmstrip buttons.
- Three-image gallery.
- Material bands.
- Cream capability section.
- Dark contact section.

That is still a lot. The page can be elegant with fewer section types.

Recommended structure:

1. Hero.
2. Signature project.
3. Three selected works.
4. Capability statement.
5. Contact.

The material section can be merged into the signature project or selected works. It currently adds another visual language.

## Corrected Design Direction

### Direction Name

**Quiet Architectural Portfolio**

Not cinematic collage. Not dark luxury brochure. Not PDF remix.

The desired feeling:

- Black gallery room.
- Warm architectural photography.
- Restrained Arabic editorial type.
- Clean project proof.
- Minimal interface.
- No noisy source artifacts.

### Visual Rules

1. One hero-scale type moment only.
2. All other headings should be 40-72px desktop, 30-44px mobile.
3. No background image with embedded text, logo, watermark, or client brand mark.
4. No image reuse across major sections unless cropped from a clean original and used for a clearly different purpose.
5. Use photos as framed works, not wallpaper.
6. Do not put captions on top of already text-heavy images.
7. Keep gold/champagne accents under 5% of the visual field.
8. Remove decorative giant background words.
9. Contact section should be clean, almost silent.
10. Mobile should feel like a premium scroll story, not a gallery dump.

## Recommended Next Implementation

### Step 1: Asset Triage

Classify every image:

- **Clean hero-safe:** no embedded logo/text, strong crop.
- **Portfolio-safe only:** has embedded logo/text, okay only inside framed project proof.
- **Reject for web:** too busy, low quality, or looks like a PDF slide.

Current likely classifications:

- `look-hero-clean.jpg`: hero-safe.
- `look-auditorium-wide.jpg`: mostly safe if cropped carefully.
- `detail-ceiling.jpg`: detail-safe.
- `detail-wood-auditorium.jpg`: detail-safe.
- `look-hayyak-seating.jpg`: portfolio-safe.
- `look-redsea-rattan.jpg`: portfolio-safe only, not background.
- `look-lica-park.jpg`: portfolio-safe only, not contact/footer background.

### Step 2: Typography Reset

Set a calmer scale:

- Hero h1 desktop: max 88-104px.
- Hero h1 mobile: max 52-62px.
- Section h2 desktop: max 56-68px.
- Section h2 mobile: max 34-42px.
- Project title desktop: max 64px.
- Contact title desktop: max 72px.

Use weight, spacing, and placement for elegance instead of extreme size.

### Step 3: Simplify Structure

Proposed final sections:

1. Hero: clean rattan image, calm headline, CTA.
2. Signature Work: one large framed project image, Arabic title, small metadata.
3. Selected Projects: three clean cards/frames, no collage.
4. Capability: very restrained cream or black section, no heavy grid.
5. Contact: clean black/warm gradient, Divani logo, WhatsApp CTA.

### Step 4: Remove Bad Backgrounds

Replace:

- Contact `look-lica-park.jpg` background with clean black/material gradient or a cropped texture without logo.
- Any section background using project spreads with client logos.
- Any repeated Red Sea image used outside the signature project.

### Step 5: Final Verification

After implementation:

- Desktop screenshot.
- Mobile screenshot.
- Hero crop check.
- Contact/footer check.
- Image reuse scan.
- Background image scan.
- Console/assets/overflow/interaction checks.

## Success Criteria

The new version should feel:

- quieter,
- more expensive,
- less theatrical,
- more controlled,
- more architectural,
- less like a PDF collage,
- less like a web template,
- and more like a premium studio presentation.

If a section looks good only because the heading is enormous, it is not elegant yet.
