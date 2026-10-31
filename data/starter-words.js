'use strict';
/* STARTER WORDS: used only until a grown-up types each twin's real school words in the parent screen.
   Grouped the way an early phonics program (UFLI-style) introduces patterns, so the game can also offer
   "this week's pattern" practice. Each twin's real list lives on the device, never here.

   picture: an ART id (data/world.js or art/) so the word can be used in "Word to picture". Words without
   a picture are still fine for "Hear it, tap it" and "Build the word". */

const STARTER_WORDS = [
  { pattern: 'short a (CVC)', words: [
    { word: 'cat', picture: 'cat' }, { word: 'hat', picture: 'hat' }, { word: 'map', picture: 'map' },
    { word: 'bag', picture: 'bag' }, { word: 'jam' }, { word: 'nap' } ] },
  { pattern: 'short i (CVC)', words: [
    { word: 'pig', picture: 'pig' }, { word: 'wig' }, { word: 'lid' }, { word: 'sit' }, { word: 'fin', picture: 'fish' }, { word: 'dig' } ] },
  { pattern: 'short o (CVC)', words: [
    { word: 'dog', picture: 'dog' }, { word: 'pot', picture: 'pot' }, { word: 'log', picture: 'log' }, { word: 'hop' }, { word: 'mop' }, { word: 'box', picture: 'box' } ] },
  { pattern: 'short u (CVC)', words: [
    { word: 'sun', picture: 'sun' }, { word: 'bug', picture: 'bug' }, { word: 'cup', picture: 'cup' }, { word: 'hug' }, { word: 'run' }, { word: 'mud' } ] },
  { pattern: 'short e (CVC)', words: [
    { word: 'bed', picture: 'bed' }, { word: 'hen', picture: 'hen' }, { word: 'pen', picture: 'pen' }, { word: 'web', picture: 'web' }, { word: 'net' }, { word: 'wet' } ] },
  { pattern: 'digraphs sh ch th', words: [
    { word: 'ship', picture: 'ship' }, { word: 'fish', picture: 'fish' }, { word: 'chip' }, { word: 'chat' }, { word: 'moth', picture: 'moth' }, { word: 'bath', picture: 'bath' } ] },
  { pattern: 'blends', words: [
    { word: 'frog', picture: 'frog' }, { word: 'drum', picture: 'drum' }, { word: 'flag', picture: 'flag' }, { word: 'nest', picture: 'nest' }, { word: 'milk', picture: 'milk' }, { word: 'jump' } ] },
  { pattern: 'magic e', words: [
    { word: 'cake', picture: 'cake' }, { word: 'kite', picture: 'kite' }, { word: 'rose', picture: 'rose' }, { word: 'bike', picture: 'bike' }, { word: 'cube' }, { word: 'gate', picture: 'gate' } ] },
  { pattern: 'heart words (sight words)', words: [
    { word: 'the' }, { word: 'said' }, { word: 'was' }, { word: 'you' }, { word: 'they' }, { word: 'have' }, { word: 'friend' }, { word: 'little' } ] },
  // The game's own words, so spell names feel like real reading too.
  { pattern: 'magic words', words: [
    { word: 'spark', picture: 'spark' }, { word: 'warm' }, { word: 'glow', picture: 'glow' }, { word: 'sprout', picture: 'sprout' },
    { word: 'dew' }, { word: 'vine', picture: 'vine' }, { word: 'bloom', picture: 'bloom' }, { word: 'fire', picture: 'fire' }, { word: 'flower', picture: 'flower' } ] },
];
