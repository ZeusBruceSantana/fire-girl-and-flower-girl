# Setup: things only the owner can do

Numbered steps, in order. Each takes a few minutes. Nothing here costs money.

## 1. Turn on the web page (GitHub Pages)

This gives the game a web address the tablet can open. One time only.

1. Open https://github.com/ZeusBruceSantana/fire-girl-and-flower-girl in a browser.
2. Click **Settings** (top tab), then **Pages** in the left menu.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Set **Branch** to **main**, folder **/ (root)**. Click **Save**.
5. Wait a minute, then refresh. The page shows the address, which will be
   `https://zeusbrucesantana.github.io/fire-girl-and-flower-girl/`.
6. Open that address. You should see the two princesses and "Coming soon".

Every later push to `main` updates the page by itself within a minute or two.

## 2. Install it on the Surface (after Epic 1)

1. On the Surface, open the address from step 1 in Microsoft Edge.
2. Click the **...** menu, then **Apps**, then **Install this site as an app**.
3. Open it from the Start menu. It runs full screen and works without internet once opened.
4. Turn the Surface sideways (landscape). The game asks for this if it is not.

For an iPad: open the address in Safari, tap **Share**, then **Add to Home Screen**.

## 3. Set up the girls (after Epic 1)

1. In the game, press and hold the top-left corner for three seconds to open the parent screen
   (or enter the PIN if you set one).
2. Type each twin's name on her side. Names stay on the tablet; they are never sent anywhere.
3. Type this week's school words for each twin, one per line. Different lists are fine.
4. Close the parent screen. The girls choose their princess and color on the start screen.

## 4. Keep your computer's copy in sync (GitHub Desktop)

Claude Code pushes changes to GitHub. To see them on your computer:

1. Open GitHub Desktop, choose this repository.
2. Click **Fetch origin**, then **Pull origin** if it appears.

If you change files on your computer, click **Push origin** before the next Claude Code session
so it starts from your latest version.

## 5. Running the tests on your computer (optional)

In a terminal, inside the repository folder:

```bash
npm install --no-save playwright@1
```

```bash
npx playwright install chromium
```

```bash
node tests/run-in-ci.js
```

GitHub runs the same tests on every change. The result shows as a green check or a red cross next
to each commit on GitHub.

## 6. Adding a painting you generated

1. Follow `docs/ART-PROMPTS.md` to make it. Save it with the exact file name given there.
2. On GitHub, open the folder (for example `art/scenes/lair`), **Add file → Upload files**, drag it in,
   **Commit changes**. Or put it in Drive `to-code/art/` and tell Claude Code.
3. Open `art/overrides.js` on GitHub, click the pencil, add a line like `'art/scenes/lair/full',`
   inside the list, **Commit changes**.
4. The page updates by itself within a couple of minutes. Tell Claude Code which scenes are in so the
   walk line and tap spots can be tuned to the painting.

## 7. The Drive handoff

- New specs for Claude Code go in Google Drive, **Reading RPG Handoff / to-code**, as plain
  Markdown. A revised spec gets a version suffix (`-v2`, `-v3`); the newest wins.
- Reports from Claude Code (STATUS.md, GAME-DESIGN.md, ART-PROMPTS.md) appear in **from-code**.
