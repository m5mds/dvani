# Divani Senior Audit After Project Showcase Regression

## Executive Read

The current page is calmer than the chaotic version, but it over-corrected in the wrong place. It removed the strongest conversion mechanism: the project showcase/runway. For an interior design and fit-out client, the projects are not a decorative section; they are the proof, the mood, and the reason to contact Divani.

The surrounding sections became quieter, but not better enough to justify losing that proof. The page now reads like a restrained static brochure: attractive in pieces, underpowered as a portfolio.

## What Went Wrong

### P0 - The Project Showcase Was Removed

The current `#work` section is only three static cards in a grid. There is no browsable project stage, no project selector, no interaction, no sense of range, and no featured case. This is the largest regression.

Evidence:

- Current source has `section.works` at `Divani (1).html:526`.
- The section uses `work-grid` and three `work-card` articles at `Divani (1).html:535`.
- There are no project buttons, no active project state, no `aria-pressed`, no project data model, and no stage image switching.

Impact:

- The user loses the part that made the portfolio feel inspectable.
- The client sees fewer projects and less range.
- The site becomes less persuasive even though it is cleaner.

Decision:

Restore the project showcase as the central section. Refine it visually; do not replace it with static cards.

### P0 - The Page Is Solving The Wrong Problem First

The previous issue was chaos in the surrounding presentation: oversized titles, noisy backgrounds, reused photos, and bad background imagery. The fix should have been:

- preserve the project proof,
- remove the weak/noisy supporting sections,
- rebuild alignment and hierarchy around the proof.

Instead, the page removed the best part and left the weaker supporting sections as the main experience.

### P1 - The Work Section Has No Hero Project

All three current work cards are equal weight. That makes the page feel flat. A premium portfolio needs one dominant project moment where the visitor can pause and inspect:

- large image,
- project title,
- sector/client/location metadata,
- one short design reading,
- project index or filmstrip to switch cases.

Static cards can exist after that, but they cannot replace it.

### P1 - Alignment Feels Unsettled Across Sections

The page uses a different grid rhythm in almost every section:

- hero: text plus proof aside,
- studio: image left, text right,
- selected work: heading right, copy left, then 3-card grid,
- details: cream section with paired images left and text right,
- capability: list left, text right,
- contact: info left, CTA right.

Alternating layouts can work, but here it creates a zig-zag reading path. The viewer keeps re-learning the page instead of following one premium editorial rhythm.

Decision:

Use one disciplined grid system:

- one max content width,
- consistent section gutters,
- consistent text column width,
- project images staged deliberately instead of alternating by habit.

### P1 - Titles Still Feel Too Loud Because Of Line Breaks

The numeric scale is lower than before, but the headings still dominate because Arabic titles are constrained into short multi-line blocks.

Current rules:

- `h1`: `clamp(3.8rem,7vw,6.5rem)` with `max-width:9ch`.
- `h2`: `clamp(2.25rem,4.5vw,4.25rem)` with `max-width:13ch`.
- mobile `h1`: up to `4.6rem`.
- mobile `h2`: up to `3rem`.

The result is calmer than the last chaotic pass, but section headings still feel like the main visual object. In a luxury interior site, the images and spaces should carry more of the emotional weight.

Decision:

- Keep one hero-scale title only.
- Reduce section headings further.
- Use width, placement, and whitespace for elegance instead of stacked oversized words.

### P1 - Projects Arrive Too Late

On desktop, the visitor sees hero, then studio/philosophy, then finally selected work. On mobile, the project proof appears after a long intro stack.

For this client pitch, the projects should appear immediately after the hero. The studio philosophy is supporting material, not the main event.

Decision:

New order should be:

1. Hero.
2. Restored project showcase.
3. Short capability/service proof.
4. Material/detail proof.
5. Contact.

### P1 - The Current Image System Is Clean But Too Static

The current pass fixed the worst image mistakes:

- no client-logo image in footer/contact background,
- no noisy PDF-spread background,
- no exact repeated image source except the Divani logo.

But it now feels conservative and static. The work images are boxed, dim, and similar in treatment. The site needs motion and visual inspection through the project showcase, not more background noise.

Decision:

Use clean images as framed proof, not wallpaper. Restore interaction through a controlled showcase:

- one large project stage,
- clean transition,
- slim project index,
- no collage,
- no photo reuse across major moments.

### P1 - Perceptual Image Reuse Still Exists

The file no longer repeats exact image references, which is good. But visually, the auditorium appears both as a selected work and again as a material/detail proof. A client will still feel repetition even if the filenames differ.

Decision:

Treat reuse by project and visual memory, not only by filename. If a project is the main selected work, avoid using a similar crop from that project in the next section unless it is intentionally part of the same featured case.

### P2 - The Cream Details Section Feels Like A Slide

The cream section is clean, but it interrupts the black gallery mood and does not feel important enough. Its two-image pair is small relative to the section height, so the section reads as a brochure divider rather than a seductive material moment.

Decision:

Either merge material details into the restored project showcase, or make it a single stronger full-width material beat with tighter copy.

### P2 - Contact Is Clean But Underwhelming

The contact section is no longer using the wrong background imagery, which is a win. But visually it is now too quiet compared to the stakes of the page. It needs a more premium closing composition without returning to noisy photos:

- clean Divani logo,
- stronger private-invitation headline,
- WhatsApp first,
- maybe one subtle material texture or thin architectural line system,
- no client-logo/image background.

### P2 - Mobile Is Clear But Not Curated

The mobile screenshot is about 6021px tall. That is not terrible, but the project cards stack as a standard feed and the titles still take too much attention. The mobile experience should feel like a tight portfolio sequence:

- hero,
- project stage,
- swipe/index projects,
- one capability band,
- contact.

## What To Keep

- Arabic-first direction.
- Reduced copy.
- Clean source-image rule.
- No client logo or text-heavy image as a background.
- No exact photo reuse across major sections.
- Warm black, bone, and champagne palette.
- Direct WhatsApp-first conversion.
- The calmer contact/footer direction.

## What To Restore

Restore the project showcase/runway as the core proof section.

It should not come back as the earlier chaotic version. It should come back as a refined premium portfolio mechanism:

- one large stage image,
- 5-7 project entries,
- active state,
- project metadata,
- one-line design reading,
- optional slim thumbnail/index strip,
- smooth image switch,
- accessible buttons with `aria-pressed`,
- mobile horizontal project selector or snap list.

## What To Remove Or Merge

- Remove the current static-only `Selected Work` grid as the main proof mechanism.
- Merge the studio philosophy into a shorter intro near the hero or after projects.
- Merge service/capability into a concise execution band.
- Rework the details section so it supports a project instead of acting as a separate slide.

## Next Implementation Rules

1. Preserve the project showcase as the conversion spine.
2. Put projects immediately after the hero.
3. Use one disciplined content grid throughout the page.
4. Reduce section title scale again; let images dominate.
5. Treat image reuse by visual memory, not only by filename.
6. Use clean images as proof frames, not atmospheric wallpaper.
7. Keep contact clean and private; no client-branded backgrounds.
8. Verify with desktop and mobile screenshots before calling it done.

## Proposed New Structure

1. **Hero**
   Clean rattan/image moment, smaller headline, direct CTA, no heavy proof aside.

2. **Project Showcase**
   The main section. Large image stage plus project selector. This restores the part the user correctly identified as good.

3. **Capability Band**
   Four quiet service lines: design, fit-out, supply, furnishing. No large cards.

4. **Material Proof**
   One strong material/detail composition, ideally tied to the active project or clearly separate from project thumbnails.

5. **Contact**
   Private, clean, direct. WhatsApp first.

## Acceptance Criteria For The Next Pass

- The project showcase is restored and clearly better than the current static cards.
- The page no longer feels chaotic, but it also no longer feels empty or generic.
- No background image contains client logos, baked-in text, or PDF-slide artifacts.
- No major image is reused in a way a human viewer would notice.
- Section headings feel editorial, not huge by default.
- Desktop and mobile screenshots show consistent alignment and a clear reading path.
- Links, mobile drawer, project switching, console, images, and horizontal overflow are verified.
