'use strict';
/* Ember Bloom: the network layer. Game code never talks to the internet; it talks to NET, which has one of:
     LocalAdapter    this device alone (the default; what the game does today)
     FakeTransport   two test frames pretending to be two devices (tests only)
     RoomAdapter     the family's shared world through a relay (Epic 10, after a grown-up sets it up)
   All three have the same small set of functions, so the rest of the game cannot tell which one is in use.

   Status is shown as a small cloud icon, never as an error:  'offline' | 'connecting' | 'live' */

class LocalAdapter {
  constructor() { this.name = 'local'; this.actionCbs = []; this.presenceCbs = []; this.statusCbs = []; this._status = 'offline'; }
  connect() { return Promise.resolve(); }
  send(action) { void action; }                       // nowhere to send it; the save already has it
  onAction(cb) { this.actionCbs.push(cb); }
  onPresence(cb) { this.presenceCbs.push(cb); }
  sendPresence(seat, p) { void seat; void p; }
  onStatus(cb) { this.statusCbs.push(cb); cb(this._status); }
  status() { return this._status; }
  isHost() { return true; }                            // alone, this device is the host
}

/* Tests only: two frames on the same page share a "bus" in local storage. Writing to it fires a 'storage'
   event in the OTHER frame, which is exactly like a message arriving from another device. */
class FakeTransport extends LocalAdapter {
  constructor(world, dev) {
    super();
    this.name = 'fake'; this.world = world; this.dev = dev; this.key = 'ember-bloom-test-bus-' + world;
    this.offline = false;                              // tests flip this to pretend the internet is gone
    this.pending = [];
    this.hostDev = 'a';                                // the test host is always device "a"
    addEventListener('storage', e => { if (e.key === this.key && e.newValue) this.receive(JSON.parse(e.newValue)); });
  }
  connect(world, seat) { this.seat = seat; this.setStatus('live'); this.post({ kind: 'join', seat, dev: this.dev }); return Promise.resolve(); }
  setStatus(s) { this._status = s; for (const cb of this.statusCbs) cb(s); }
  goOffline() { this.offline = true; this.setStatus('offline'); }
  goOnline() { this.offline = false; this.setStatus('live'); const p = this.pending; this.pending = []; for (const m of p) this.post(m); for (const a of outboxAll()) this.post({ kind: 'action', action: a }); }
  post(msg) {
    if (this.offline) { this.pending.push(msg); return; }
    msg.from = this.dev; msg.n = (this.n = (this.n || 0) + 1);
    localStorage.setItem(this.key, JSON.stringify(msg));
  }
  send(action) { outboxPush(action); this.post({ kind: 'action', action }); }
  sendPresence(seat, p) { this.post({ kind: 'presence', seat, p }); }
  receive(msg) {
    if (msg.from === this.dev) return;
    if (this.offline) { return; }                      // we will ask for what we missed when we come back (see goOnline: outbox resend)
    if (msg.kind === 'action') { for (const cb of this.actionCbs) cb(msg.action); this.post({ kind: 'ack', ids: [msg.action.id] }); }
    if (msg.kind === 'ack') outboxAck(msg.ids);
    if (msg.kind === 'presence') for (const cb of this.presenceCbs) cb(msg.seat, msg.p, msg.from);
    if (msg.kind === 'join') for (const cb of this.presenceCbs) cb(msg.seat, { joined: true }, msg.from);
  }
  isHost() { return this.dev === this.hostDev; }
}

/* Pick the adapter for this page. */
function createAdapter() {
  const world = QUERY.get('world') || S.settings.worldCode;
  if (TEST_MODE && world) return new FakeTransport(world, S.settings.deviceId);
  return new LocalAdapter();   // RoomAdapter arrives in Epic 10
}
const NET = createAdapter();
NET.onAction(applyRemote);
