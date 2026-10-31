# Status

**Updated:** 2026-10-31 · **Epic:** 0, Discovery · **State:** waiting for the owner's approval

## Done

- Repo created and scaffolded. Plain HTML/CSS/JS, no build step, same approach as Twin Pets.
- `docs/DISCOVERY.md`: stack, save system, data formats, learning loop, fire/flower balance, the
  ordered plan with effort, risks and questions.
- `docs/WORLD.md`: the story bible.
- Content data files in `data/`: world, items with rarity, areas, quests, challenge types,
  starter words. Six areas and seven quests described; Epic 2 ships a subset.
- Placeholder title screen (`index.html`): shows both princesses from the data files, installs
  as an app, works offline, saves. No gameplay.
- Tests (5) and the GitHub Actions check. All passing.
- `docs/SETUP.md` with the owner's steps. `CLAUDE.md` with the working agreement.

## Next

- Owner reviews DISCOVERY.md §8 (questions) and approves Epic 1.
- Owner turns on GitHub Pages (SETUP.md step 1) so the page has a web address.
- Epic 1, the shell: start screen, pick your princess and color, names (grown-up), join / leave,
  read-aloud helper, parent screen with per-twin word entry.

## Blockers

- None.

## Decisions needed

See `docs/DISCOVERY.md` §8. The game works with the defaults; nothing blocks Epic 1.

1. Which twin is Fire Girl, which is Flower Girl (default: they choose on first launch).
2. Name of the money (default: coins).
3. Shared or separate wallets (default: separate).
4. Keep the proposed names: Emberfall, Petalvale, Thistledown School, Middlemarket.
