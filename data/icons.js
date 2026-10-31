'use strict';
/* ICONS (Phase C): one icon set, one style. Filled two-tone silhouettes on a 100-unit grid: the body is
   `currentColor` (so CSS recolours it per rarity, or dims it to a silhouette for things not found yet), the
   details are a soft ink shade, the shine a soft white. Placeholders until painted icons arrive; they replace
   the one grey diamond everywhere an item, a badge or a Lair piece is shown.

   ITEM_ICONS        one per item category. An item's category is ITEM_CATEGORY[id], else its `art` field.
   ITEM_CATEGORY     items whose `art` is too general (the materials and paints are drawn as 'gem' in items.js).
   BADGE_ICON        the badge medal for the Badges wall.
   ROOM_ICONS        one per Lair upgrade `art` (data/lair.js): drawn bright when owned, as a ghost outline when not.
                     { svg, color }: color is the piece's own colour when it is in the room.               */

const ICON_LINE = 'stroke="rgba(59,47,34,.55)" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"';
const ICON_DARK = 'fill="rgba(59,47,34,.32)"';
const ICON_SHINE = 'fill="rgba(255,255,255,.55)"';
const icon = body => `<svg viewBox="0 0 100 100" aria-hidden="true">${body}</svg>`;

const ITEM_ICONS = {
  wand: icon(`<path d="M24 84 L66 34" stroke-width="12" ${ICON_LINE}/><path d="M24 84 L66 34" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>
    <path d="M72 10 L77 22 L90 24 L80 33 L83 46 L72 39 L61 46 L64 33 L54 24 L67 22Z" fill="currentColor" ${ICON_LINE}/><circle cx="72" cy="28" r="4" ${ICON_SHINE}/>`),
  crown: icon(`<path d="M14 76 L18 32 L36 52 L50 22 L64 52 L82 32 L86 76Z" fill="currentColor" ${ICON_LINE}/><rect x="14" y="70" width="72" height="12" rx="4" ${ICON_DARK}/>
    <circle cx="50" cy="56" r="6" ${ICON_SHINE}/><circle cx="30" cy="62" r="4" ${ICON_SHINE}/><circle cx="70" cy="62" r="4" ${ICON_SHINE}/>`),
  cape: icon(`<path d="M34 16 H66 L86 86 C70 80 60 88 50 82 C40 88 30 80 14 86Z" fill="currentColor" ${ICON_LINE}/><path d="M34 16 H66 L60 30 H40Z" ${ICON_DARK}/>
    <path d="M38 34 L28 78" stroke="rgba(255,255,255,.45)" stroke-width="5" stroke-linecap="round"/>`),
  boots: icon(`<path d="M30 14 H58 V58 L82 64 C88 66 88 84 82 86 H24 V24Z" fill="currentColor" ${ICON_LINE}/><rect x="24" y="76" width="64" height="10" rx="4" ${ICON_DARK}/>
    <path d="M36 24 V58" stroke="rgba(255,255,255,.45)" stroke-width="5" stroke-linecap="round"/>`),
  gem: icon(`<path d="M30 18 H70 L88 42 L50 88 L12 42Z" fill="currentColor" ${ICON_LINE}/><path d="M12 42 H88 L50 88Z" ${ICON_DARK}/><path d="M30 18 L40 42 H60 L70 18" fill="rgba(255,255,255,.35)"/>`),
  seed: icon(`<path d="M50 90 C28 90 20 72 24 58 C28 44 42 38 50 38 C58 38 72 44 76 58 C80 72 72 90 50 90Z" fill="currentColor" ${ICON_LINE}/>
    <path d="M50 38 C50 26 54 18 62 12 M50 30 C42 24 34 24 28 28 C36 34 44 34 50 30" fill="none" stroke="rgba(47,125,74,.9)" stroke-width="6" ${ICON_LINE}/><ellipse cx="40" cy="62" rx="5" ry="9" ${ICON_SHINE}/>`),
  book: icon(`<path d="M18 18 H76 C80 18 82 20 82 24 V84 H24 C20 84 18 82 18 78Z" fill="currentColor" ${ICON_LINE}/><path d="M24 72 H82 V84 H24 C20 84 18 82 18 78 C18 74 20 72 24 72Z" fill="#fff8ec" ${ICON_LINE}/>
    <rect x="34" y="30" width="34" height="8" rx="3" ${ICON_DARK}/><rect x="34" y="44" width="24" height="6" rx="3" ${ICON_DARK}/>`),
  paint: icon(`<path d="M24 40 H76 V80 C76 86 72 88 66 88 H34 C28 88 24 86 24 80Z" fill="currentColor" ${ICON_LINE}/><rect x="20" y="32" width="60" height="12" rx="5" ${ICON_DARK} ${ICON_LINE}/>
    <path d="M36 44 V58 C36 62 42 62 42 58 V44" fill="rgba(255,255,255,.5)"/><path d="M58 14 L70 32" stroke-width="8" ${ICON_LINE}/>`),
  material: icon(`<path d="M24 46 C24 34 36 30 50 30 C64 30 76 34 76 46 L82 78 C82 86 74 90 50 90 C26 90 18 86 18 78Z" fill="currentColor" ${ICON_LINE}/>
    <path d="M38 30 L44 18 H56 L62 30" fill="currentColor" ${ICON_LINE}/><rect x="36" y="28" width="28" height="7" rx="3" ${ICON_DARK}/><circle cx="38" cy="58" r="6" ${ICON_SHINE}/>`),
  treat: icon(`<path d="M12 64 C12 40 30 28 50 28 C70 28 88 40 88 64 C88 74 78 80 50 80 C22 80 12 74 12 64Z" fill="currentColor" ${ICON_LINE}/>
    <path d="M30 44 C34 52 34 58 30 64 M50 38 C54 48 54 58 50 66 M70 44 C66 52 66 58 70 64" fill="none" stroke="rgba(59,47,34,.35)" stroke-width="5" stroke-linecap="round"/><ellipse cx="38" cy="40" rx="8" ry="4" ${ICON_SHINE}/>`),
  scroll: icon(`<rect x="24" y="22" width="52" height="56" rx="4" fill="currentColor" ${ICON_LINE}/><rect x="16" y="14" width="68" height="14" rx="7" fill="currentColor" ${ICON_LINE}/>
    <rect x="16" y="72" width="68" height="14" rx="7" fill="currentColor" ${ICON_LINE}/><rect x="34" y="38" width="32" height="5" rx="2.5" ${ICON_DARK}/><rect x="34" y="50" width="24" height="5" rx="2.5" ${ICON_DARK}/>`),
};

const ITEM_CATEGORY = {
  'charcoal': 'material', 'petals': 'material', 'spark-dust': 'material',
  'ash-paint': 'paint', 'petal-dye': 'paint', 'glow-ink': 'paint', 'lantern-paint': 'paint',
};

const BADGE_ICON = icon(`<path d="M34 8 H48 L44 40 H30Z M52 8 H66 L70 40 H56Z" fill="#e0609c" ${ICON_LINE}/>
  <circle cx="50" cy="62" r="28" fill="currentColor" ${ICON_LINE}/><circle cx="50" cy="62" r="19" ${ICON_DARK}/>
  <path d="M50 46 L55 57 L67 58 L58 66 L61 78 L50 72 L39 78 L42 66 L33 58 L45 57Z" fill="currentColor"/><circle cx="40" cy="52" r="4" ${ICON_SHINE}/>`);

const ROOM_ICONS = {
  cushions:  { color: '#e07a5f', svg: icon(`<ellipse cx="28" cy="70" rx="22" ry="12" fill="currentColor" ${ICON_LINE}/><ellipse cx="72" cy="70" rx="22" ry="12" fill="currentColor" ${ICON_LINE}/><ellipse cx="50" cy="56" rx="24" ry="13" fill="currentColor" ${ICON_LINE}/><ellipse cx="44" cy="52" rx="8" ry="3" ${ICON_SHINE}/>`) },
  lantern:   { color: '#ffc94a', svg: icon(`<path d="M50 6 V18" ${ICON_LINE}/><path d="M36 18 H64 L60 26 H40Z" ${ICON_DARK} ${ICON_LINE}/><path d="M36 26 H64 L70 70 H30Z" fill="currentColor" ${ICON_LINE}/><path d="M50 36 C42 48 44 58 50 62 C56 58 58 48 50 36Z" fill="#ff8a3d"/><rect x="28" y="70" width="44" height="10" rx="4" ${ICON_DARK} ${ICON_LINE}/>`) },
  caseboard: { color: '#c9a06a', svg: icon(`<rect x="12" y="18" width="76" height="60" rx="5" fill="currentColor" ${ICON_LINE}/><rect x="22" y="28" width="22" height="16" fill="#fff8ec"/><rect x="56" y="48" width="22" height="16" fill="#fff8ec"/><path d="M33 36 L67 56" stroke="#c23b3b" stroke-width="3"/><circle cx="33" cy="30" r="3.5" fill="#e0609c"/><circle cx="67" cy="50" r="3.5" fill="#e0609c"/>`) },
  map:       { color: '#e8d3a2', svg: icon(`<path d="M10 24 L36 14 L64 24 L90 14 V76 L64 86 L36 76 L10 86Z" fill="currentColor" ${ICON_LINE}/><path d="M36 14 V76 M64 24 V86" stroke="rgba(59,47,34,.3)" stroke-width="3"/><path d="M20 62 C32 50 46 66 58 48 S78 38 82 30" fill="none" stroke="#c23b3b" stroke-width="3" stroke-dasharray="5 4"/>`) },
  gallery:   { color: '#c98b4a', svg: icon(`<rect x="8" y="22" width="38" height="30" rx="2" fill="currentColor" ${ICON_LINE}/><rect x="14" y="28" width="26" height="18" fill="#bfe3ff"/><rect x="54" y="30" width="38" height="44" rx="2" fill="currentColor" ${ICON_LINE}/><rect x="60" y="36" width="26" height="32" fill="#ffd9c2"/><circle cx="73" cy="48" r="6" fill="#ff8a3d"/>`) },
  snacks:    { color: '#5cb8e6', svg: icon(`<rect x="12" y="44" width="44" height="38" rx="6" fill="currentColor" ${ICON_LINE}/><rect x="10" y="38" width="48" height="10" rx="4" ${ICON_DARK} ${ICON_LINE}/><path d="M64 36 H84 V80 C84 84 80 86 76 86 H72 C68 86 64 84 64 80Z" fill="#fff8ec" ${ICON_LINE}/><path d="M84 46 C94 46 94 64 84 64" fill="none" ${ICON_LINE}/>`) },
  guest:     { color: '#9a6cf0', svg: icon(`<ellipse cx="50" cy="66" rx="34" ry="16" fill="currentColor" ${ICON_LINE}/><ellipse cx="50" cy="62" rx="22" ry="7" ${ICON_DARK}/><path d="M50 26 C44 20 34 22 34 32 C34 42 50 48 50 48 C50 48 66 42 66 32 C66 22 56 20 50 26Z" fill="#ff6f9c" ${ICON_LINE}/>`) },
  stuffies:  { color: '#a9783f', svg: icon(`<rect x="10" y="60" width="80" height="20" rx="6" fill="currentColor" ${ICON_LINE}/><circle cx="44" cy="46" r="14" fill="#d9b48a" ${ICON_LINE}/><circle cx="34" cy="34" r="6" fill="#d9b48a" ${ICON_LINE}/><circle cx="54" cy="34" r="6" fill="#d9b48a" ${ICON_LINE}/><rect x="56" y="54" width="26" height="10" rx="4" fill="#fff8ec"/>`) },
  bookshelf: { color: '#8a5a3a', svg: icon(`<rect x="14" y="10" width="72" height="80" rx="4" fill="currentColor" ${ICON_LINE}/><path d="M14 38 H86 M14 64 H86" stroke="rgba(59,47,34,.55)" stroke-width="4"/><rect x="22" y="16" width="8" height="20" fill="#e07a5f"/><rect x="32" y="18" width="8" height="18" fill="#52b86a"/><rect x="42" y="14" width="8" height="22" fill="#8f6cf0"/><rect x="24" y="44" width="10" height="18" fill="#ffd23f"/><rect x="36" y="42" width="8" height="20" fill="#5cb8e6"/>`) },
  radio:     { color: '#8f6cf0', svg: icon(`<rect x="14" y="36" width="72" height="48" rx="8" fill="currentColor" ${ICON_LINE}/><circle cx="36" cy="60" r="12" ${ICON_DARK}/><rect x="56" y="50" width="20" height="6" rx="3" fill="#fff8ec"/><rect x="56" y="62" width="20" height="6" rx="3" fill="#fff8ec"/><path d="M60 36 L76 12" ${ICON_LINE}/><circle cx="76" cy="12" r="4" fill="#ffd23f"/>`) },
  periscope: { color: '#7fa8b8', svg: icon(`<path d="M40 90 V30 H66 V18 H84 V40 H66 V44 H56 V90Z" fill="currentColor" ${ICON_LINE}/><rect x="68" y="22" width="12" height="14" rx="3" fill="#bfe3ff"/><rect x="34" y="80" width="28" height="10" rx="3" ${ICON_DARK}/>`) },
  bunting:   { color: '#ff8a3d', svg: icon(`<path d="M6 22 C30 34 70 34 94 22" fill="none" ${ICON_LINE}/><path d="M14 26 L22 50 L30 30Z" fill="currentColor" ${ICON_LINE}/><path d="M38 31 L46 56 L54 32Z" fill="#52b86a" ${ICON_LINE}/><path d="M62 31 L70 54 L78 29Z" fill="#8f6cf0" ${ICON_LINE}/>`) },
  rug:       { color: '#e0609c', svg: icon(`<ellipse cx="50" cy="60" rx="42" ry="22" fill="currentColor" ${ICON_LINE}/><ellipse cx="50" cy="60" rx="30" ry="14" fill="#ffd23f" opacity=".7"/><ellipse cx="50" cy="60" rx="16" ry="7" fill="#5cb8e6" opacity=".8"/>`) },
  'lamp-blue': { color: '#5c8fe6', svg: icon(`<path d="M50 6 V22" ${ICON_LINE}/><path d="M30 46 L40 22 H60 L70 46Z" fill="currentColor" ${ICON_LINE}/><path d="M38 46 C40 58 60 58 62 46" fill="#ffe08a" ${ICON_LINE}/>`) },
  'lamp-pink': { color: '#ff8fb8', svg: icon(`<path d="M50 6 V22" ${ICON_LINE}/><path d="M30 46 L40 22 H60 L70 46Z" fill="currentColor" ${ICON_LINE}/><path d="M38 46 C40 58 60 58 62 46" fill="#ffe08a" ${ICON_LINE}/>`) },
  'lamp-gold': { color: '#f0b429', svg: icon(`<path d="M50 6 V22" ${ICON_LINE}/><path d="M30 46 L40 22 H60 L70 46Z" fill="currentColor" ${ICON_LINE}/><path d="M38 46 C40 58 60 58 62 46" fill="#ffe08a" ${ICON_LINE}/>`) },
  windowbox: { color: '#a9783f', svg: icon(`<rect x="12" y="56" width="76" height="24" rx="4" fill="currentColor" ${ICON_LINE}/><circle cx="28" cy="44" r="9" fill="#ff6f9c" ${ICON_LINE}/><circle cx="50" cy="40" r="9" fill="#ffd23f" ${ICON_LINE}/><circle cx="72" cy="44" r="9" fill="#8f6cf0" ${ICON_LINE}/>`) },
  kettle:    { color: '#c94f3d', svg: icon(`<path d="M24 82 C18 60 26 40 50 40 C74 40 82 60 76 82Z" fill="currentColor" ${ICON_LINE}/><path d="M24 58 L8 44" stroke-width="7" ${ICON_LINE}/><path d="M36 40 C36 24 64 24 64 40" fill="none" stroke-width="6" ${ICON_LINE}/><ellipse cx="40" cy="56" rx="6" ry="4" ${ICON_SHINE}/>`) },
  clock:     { color: '#8a5a3a', svg: icon(`<path d="M50 6 L84 34 V88 H16 V34Z" fill="currentColor" ${ICON_LINE}/><circle cx="50" cy="52" r="18" fill="#fff8ec" ${ICON_LINE}/><path d="M50 52 V40 M50 52 L60 58" ${ICON_LINE}/><rect x="42" y="20" width="16" height="12" rx="3" ${ICON_DARK}/>`) },
  stars:     { color: '#ffe08a', svg: icon(`<path d="M30 14 L34 26 L46 28 L37 36 L40 48 L30 41 L20 48 L23 36 L14 28 L26 26Z" fill="currentColor" ${ICON_LINE}/><path d="M70 40 L73 49 L82 50 L75 56 L77 65 L70 60 L63 65 L65 56 L58 50 L67 49Z" fill="currentColor" ${ICON_LINE}/><circle cx="76" cy="18" r="4" fill="currentColor"/><circle cx="28" cy="72" r="4" fill="currentColor"/>`) },
  doormat:   { color: '#a9783f', svg: icon(`<rect x="10" y="52" width="80" height="30" rx="5" fill="currentColor" ${ICON_LINE}/><path d="M22 60 V74 M34 60 V74 M46 60 V74 M58 60 V74 M70 60 V74" stroke="rgba(59,47,34,.35)" stroke-width="4" stroke-linecap="round"/>`) },
  chime:     { color: '#c8d8e8', svg: icon(`<path d="M20 14 H80" stroke-width="6" ${ICON_LINE}/><path d="M30 14 V40 M44 14 V56 M58 14 V48 M72 14 V36" stroke="rgba(59,47,34,.5)" stroke-width="2"/><rect x="26" y="40" width="8" height="24" rx="3" fill="currentColor" ${ICON_LINE}/><rect x="40" y="56" width="8" height="26" rx="3" fill="currentColor" ${ICON_LINE}/><rect x="54" y="48" width="8" height="24" rx="3" fill="currentColor" ${ICON_LINE}/><rect x="68" y="36" width="8" height="22" rx="3" fill="currentColor" ${ICON_LINE}/>`) },
  flowerjar: { color: '#bfe3ff', svg: icon(`<path d="M34 54 H66 L70 88 H30Z" fill="currentColor" ${ICON_LINE}/><path d="M50 54 V30" stroke="#2f7d4a" stroke-width="5"/><circle cx="50" cy="24" r="10" fill="#ff6f9c" ${ICON_LINE}/><circle cx="50" cy="24" r="4" fill="#ffd23f"/>`) },
};
