# KrishVerse

A concept preview of Krish P's portfolio site - Signal × Orbit direction.

## Structure

- `index.html` - Home
- `work.html` - the full project map, grouped by capability
- `about.html` - story + timeline
- `capabilities.html` - Understand → Build → Optimize → Grow
- `contact.html` - contact
- `css/style.css` - design system (tokens, components, both themes)
- `js/main.js` - neural-network background, sliders, reveal-on-scroll, magnetic buttons, theme toggle
- `js/orbit.js` - Work page solar system (categories as planets, projects as moons)
- `js/playground.js` - Home page physics playground (uses Matter.js from cdnjs)
- `js/planet.js` - the KrishVerse planet, a WebGL gas giant: the footer horizon (falls back to the CSS `.footer-horizon` without WebGL) and, via `window.KVPlanet`, the centre of the Work page solar system
- `assets/fonts/` - Bricolage Grotesque, Instrument Serif (italic), Instrument Sans
- `assets/favicon.svg` - brand mark

## Local preview

```bash
powershell -File serve.ps1
```

Then open `http://localhost:8934/`.

No build step or dependencies - plain HTML/CSS/JS.
