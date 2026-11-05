# knowthetimes.com

The website for Know the Times and The Faithful Remnant, hosted on Netlify.

## What's in here

- `site/` holds the pages people see: the home page (`index.html`), the tools page (`tools/`), and all images, styles, and scripts (`assets/`).
- `netlify/functions/posts.mjs` reads both Substack feeds, so the home page always shows the latest posts. Nothing needs updating when you publish.
- `netlify.toml` tells Netlify where everything lives and makes tools.knowthetimes.com show the tools page.

## Common changes

- **Add a series card:** copy one `<a class="series-card">` block in `site/index.html`, then change its image, name, part count, and link. Put the image in `site/assets/img/series/`.
- **Link a series card to its hub page:** change that card's `href`.
- **Add a tool or guide:** copy a `resource` block in `site/tools/index.html`.

When you edit a file on GitHub and commit, Netlify republishes the site within a minute or two.
