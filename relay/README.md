# The relay (live co-play)

A tiny Cloudflare Worker: one "room" per family world code. Devices connect over a WebSocket, send
their actions, and get everyone else's. The room keeps the action log so a device that was away
catches up. No accounts, no names, no word lists ever pass through it. $0 on the free plan.

Steps for the grown-up are in `docs/SETUP.md`, section 7. The game side is `RoomAdapter` in
`js/net.js`; paste the Worker's URL into the grown-up corner and every device with the same world
code joins the same world.
