'use strict';
/* Ember Bloom: the placeholder title screen (Epic 0).
   Shows the game name and both heroes from data/world.js. Epic 1 replaces this with the real start screen
   (pick your princess, pick your color, join / leave). */

function showTitle() {
  $('#game-title').textContent = WORLD.title;
  $('#game-tagline').textContent = WORLD.tagline;
  // Until the girls have chosen, the left half previews one princess and the right half the other.
  const left = S.heroes.left.kind || WORLD.defaultSides.left;
  const right = S.heroes.right.kind || WORLD.defaultSides.right;
  for (const [side, kind] of [['left', left], ['right', right]]) {
    const hero = WORLD.heroes[kind];
    $(`#art-${side}`).innerHTML = ART[hero.art];
    $(`#name-${side}`).textContent = hero.title;
    applyColor(side, S.heroes[side].color || hero.defaultColor);
  }
  setScene('title');
}
showTitle();
