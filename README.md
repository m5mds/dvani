# Divani

Static multipage website for Divani interior design and fit-out.

## Pages

- `index.html`
- `about.html`
- `why-us.html`
- `services.html`
- `projects.html`
- `clients.html`
- `certificates.html`
- `quote.html`
- `contact.html`

`Divani (1).html` is kept as a compatibility copy of the homepage.

## Structure

- `assets/` contains site CSS, JavaScript, logos, certificates, and project imagery.
- `tasks/build-multipage-site.js` is the source generator for all HTML pages and shared assets.
- `docs/plans/` contains design direction notes.

## Regenerate

```powershell
node tasks\build-multipage-site.js
```

The site is static and can be opened directly from `index.html`.
