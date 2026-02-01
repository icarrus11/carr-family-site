# Grace Pages

## Overview
- `/grace/` is the public prologue with safe content only.
- `/grace/chapters/` is the private chapters experience (intended to be protected by Cloudflare Access).

## Folder structure
```
/grace/
  index.html
  styles.css
  app.js
  data/
    public_content.json
  assets/
    poems/
    art/
  chapters/
    index.html
    data/
      private_content.json
  diagrams/
    workflow.mmd
    file-layout.mmd
```

## Adding poems, art, and memories
1. Place new images in `/grace/assets/poems/` or `/grace/assets/art/`.
2. Update `public_content.json` (safe placeholders) and `chapters/data/private_content.json` (protected content).
3. Each item supports:
   - `id`
   - `title`
   - `memoryText`
   - `imagePath`

## Adding new phrase actions
Phrase detection happens after unlock and after any tile swap in `/grace/app.js`.
- Update the `phraseActions` map inside `evaluatePhrases`.
- Each phrase is a two-word lowercased string such as `"crazy bear"`.

## Cloudflare Access protection (conceptual)
1. In Cloudflare Zero Trust, create an Access application for the path `/grace/chapters/*`.
2. Add a policy that allows only approved identities or emails.
3. Leave `/grace/` public; it contains only placeholders.
4. Validate by visiting `/grace/chapters/` in an incognito session (should prompt for Access).

## Debug logging
Append `?debug=1` to `/grace/` or `/grace/chapters/` to see console logs for attempts, swaps, and phrase actions.
