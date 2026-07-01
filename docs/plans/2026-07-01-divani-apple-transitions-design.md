# Divani Apple-Like Transitions Design

## Approved Direction

Make Divani feel like using an Apple product by adding native-feeling transitions between pages and project states.

The site remains a static multipage website. We will not convert it into a heavy single-page app.

## Page Transitions

- Use CSS cross-document View Transitions for same-origin page navigation.
- Keep the motion dark, soft, and quiet:
  - old page fades down and slightly back,
  - new page fades in with a small upward lift,
  - the site background stays dark and stable.
- Assign stable transition names to key shared elements:
  - top navigation/header,
  - brand mark,
  - main content,
  - hero media.
- Add a JavaScript fallback:
  - intercept internal page links,
  - add an exit class,
  - navigate after a short delay.
- Respect reduced-motion preferences.

## Project Transitions

- Use same-document `document.startViewTransition()` when switching projects.
- Update image, title, meta, and description inside the transition callback.
- Add stable transition names for project image and project text elements.
- Keep the fallback behavior for unsupported browsers.
- Avoid flashy motion: no big slides, no spinning, no parallax gimmicks.

## Interaction Rules

- Do not delay external links, PDF downloads, phone links, WhatsApp links, forms, hash links, or new-tab links.
- Do not animate mobile drawer links in a way that breaks focus or navigation.
- Prevent rapid project-click timer races.
- Keep transitions optional and progressive.

## Success Criteria

- Page navigation feels soft and native in supported browsers.
- Project switching feels like a product morph instead of a content swap.
- Unsupported browsers still work normally.
- Reduced-motion users get no forced animation.
- Browser audit remains clean: links, images, overflow, forms, drawer, project switching, and errors.
