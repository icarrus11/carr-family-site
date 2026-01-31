# Codex Task: Carr15 Login + Landing Flow (Static Site)

## Goal
Implement a simple, kid-friendly **teaching login** for the Carr15 family homepage so that:

- **`/` (homepage)** is always visible (no login required).
- Clicking protected links while logged out sends user to **`/login/`**.
- After successful login, user can access **`/home/`** and **`/profiles/*`** pages.
- Logged-out users attempting to visit **`/home/`** or **`/profiles/*`** are redirected to **`/login/`**.
- Logout clears the session and returns to **`/`**.

> Note: This is **not** bank-grade security. It uses `localStorage` and is meant for learning, flow control, and keeping casual clicks out.

---

## Repo Context (from Jonathan)
- GitHub repo: `icarrus11/carr-family-site`
- Cloudflare Pages publishes from: **`/public`**
- Current structure:
  - `public/index.html`
  - `public/script.js`
  - `public/style.css`

---

## Implementation Plan (Do NOT break the existing homepage look)

### 0) Create a new branch
- Create branch: `feature/login-flow`
- Do all work on this branch.

### 1) Create directories inside `/public`
Create these folders under `public/`:
- `assets/`
- `login/`
- `home/`
- `profiles/`

If the environment requires placeholder files for empty dirs, create `.keep` files temporarily (they can be removed once real files exist):
- `public/assets/.keep`
- `public/login/.keep`
- `public/home/.keep`
- `public/profiles/.keep`

### 2) Move existing CSS/JS into `/public/assets`
- Create: `public/assets/style.css` and copy contents of existing `public/style.css`
- Create: `public/assets/site.js` and copy contents of existing `public/script.js`

Then update `public/index.html` to use:
- CSS: `/assets/style.css`
- JS:  `/assets/site.js`

After confirming references are updated, remove the old root files:
- delete `public/style.css`
- delete `public/script.js`

> Acceptance check: `https://carr15.com/` still renders correctly with same style/behavior as before (other than link behavior we’ll add next).

### 3) Add a simple login page
Create file: `public/login/index.html`

Requirements:
- Basic login form (username + password)
- On success:
  - set `localStorage.setItem("carr15_auth","true")`
  - redirect to `/home/`
- On failure:
  - show a message like “Login failed”

Use demo users (can be changed later):
- `jonathan / carr15`
- (Optional) add `grace` and `maggie` placeholders if desired, but not required.

### 4) Add a post-login home page with guard + logout
Create file: `public/home/index.html`

Requirements:
- If not logged in, redirect to `/login/`
- If logged in, show a simple “Home” view and a **Logout** button
- Logout should:
  - remove `carr15_auth` from localStorage
  - redirect to `/`

### 5) Add a reusable guard script (optional but recommended)
Create file: `public/home/guard.js`

Behavior:
- If `localStorage.carr15_auth !== "true"` redirect to `/login/`

Then, for any protected page, include:
```html
<script src="/home/guard.js"></script>
```

### 6) Wire homepage links to require login
In `public/assets/site.js`, add:

- `isLoggedIn()` helper
- `requireLogin(path)` function:
  - if logged in -> navigate to `path`
  - else -> navigate to `/login/`

Update `public/index.html` so each protected row/link triggers:
- `requireLogin('/profiles/dog/')` etc.

If the homepage uses `<a href>`, intercept clicks via JS when logged out.

> Acceptance check:
- Logged out:
  - Homepage shows normally
  - Clicking “Dog/Cat/Jonathan/etc” takes you to `/login/`
  - Visiting `/home/` redirects to `/login/`
- Logged in:
  - `/home/` loads
  - Clicking profile links navigates to their pages (will exist in next step)
  - Logout returns to `/` and re-locks protected links

### 7) Add basic profile pages (minimum viable)
Create these paths (each with an `index.html`):
- `public/profiles/dog/index.html`
- `public/profiles/cat/index.html`
- `public/profiles/jonathan/index.html`
- `public/profiles/spouse/index.html`
- `public/profiles/member1/index.html`
- `public/profiles/member2/index.html`
- `public/profiles/baby/index.html`

Each page should:
- include the guard (either inline or `/home/guard.js`)
- include a “Back to Home” link and Logout
- display a simple heading (e.g., “🐶 Dog”)

### 8) Clean up placeholders + commit
- Remove any `.keep` placeholder files if directories now contain real files.
- Commit message:
  - `Add login flow and protected home/profiles`
- Push branch and open a PR to `main`.

---

## Test Checklist (Must Pass)
1. Open incognito:
   - Visit `/` -> loads homepage
   - Click “Dog” -> goes to `/login/`
2. Login with `jonathan / carr15`:
   - Goes to `/home/`
3. Visit `/profiles/dog/`:
   - Loads and shows Dog page
4. Logout:
   - Returns to `/`
5. Try `/home/` while logged out:
   - Redirects to `/login/`

---

## Notes
- Keep the existing design as much as possible. Only adjust link behavior to add login gating.
- Don’t add kid-editing features yet. This task is strictly: homepage -> login -> home -> profiles gating.
