# How a reviewer plays the game headlessly

Start a server from the repo root: `python3 -m http.server 8790 &` (pick a port). Then with Playwright
(preinstalled, `require('playwright')`), open `http://localhost:8790/index.html?test` with a 1280x800
viewport. `?test` uses a throwaway save. Seed a ready save first by visiting `tests/index.html` and setting
`localStorage['ember-bloom-test-save']` to `{"heroes":{"left":{"kind":"fire","color":"orange","setup":true,"joined":true},"right":{"kind":"flower","color":"green","setup":true,"joined":true}},"shared":{"flags":{"intro-seen":true}}}`
(leave it unset to see the first-launch flow). Useful globals in the page: `S` (state), `Day` (`Day.part`,
`Day.onThing(seat, {action})`, `Day.runClass('spells')`), `stageGo('map:school-grounds')`, `MapStage.tap(seat, x, y)`,
`Menu.open(seat, tab)`, `Battle.start({...})`, `Dialogue`, `Challenge.active`, `TEST_ERRORS`. Do not `await`
promises that wait for a tap (dialogues, challenges); fire them and screenshot. Taps on HTML: dispatch
`new PointerEvent('pointerdown', { bubbles: true })` on the element. Screenshots go in your scratchpad.
See tests/*.js for working examples of every flow.
