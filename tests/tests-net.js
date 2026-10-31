'use strict';
/* The relay adapter, against a pretend room (a fake WebSocket that behaves like relay/worker.js). */

class FakeRoomSocket {
  constructor(url) { this.url = url; this.sent = []; FakeRoomSocket.last = this; setTimeout(() => this.onopen && this.onopen(), 1); }
  send(s) { const m = JSON.parse(s); this.sent.push(m);
    if (m.kind === 'hello') this.reply({ kind: 'snapshot', actions: FakeRoomSocket.log.filter(e => e.seq > (m.since || 0)).map(e => e.action), seq: FakeRoomSocket.log.length, lead: 'other-device' });
    if (m.kind === 'action') { FakeRoomSocket.log.push({ seq: FakeRoomSocket.log.length + 1, action: m.action }); this.reply({ kind: 'ack', ids: [m.action.id], seq: FakeRoomSocket.log.length }); }
  }
  reply(msg) { setTimeout(() => this.onmessage && this.onmessage({ data: JSON.stringify(msg) }), 1); }
  close() { this.onclose && this.onclose(); }
}
FakeRoomSocket.log = [];

test('The relay adapter joins a room, replays missed actions, sends its outbox and takes acks', async () => {
  await openGame(readySave());
  await until(() => G('scene') === 'title', 10000, 'the title');
  G(`window.FakeRoomSocket = ${FakeRoomSocket.toString()}; FakeRoomSocket.log = [{ seq: 1, action: { id: 'other-device-1', t: 1, dev: 'other-device', hero: 'away', type: 'flag.set', payload: { flag: 'from-the-relay' } } }];
      RoomAdapter.WebSocket = FakeRoomSocket; window.RA = new RoomAdapter('https://relay.example', S.settings.deviceId); RA.onAction(applyRemote); window.__statuses = []; RA.onStatus(s => window.__statuses.push(s));
      outboxPush({ id: 'me-9', t: 2, dev: S.settings.deviceId, hero: 'left', type: 'flag.set', payload: { flag: 'waited-in-outbox' } }); RA.connect('abcdefghijklmnopqrstuvwx', 'left');`);
  await until(() => G('RA.status()') === 'live', 3000, 'the room to be live');
  expect(G('S.shared.flags["from-the-relay"]'), 'the missed action was replayed into the world');
  await until(() => G('outboxAll().length') === 0, 3000, 'the outbox to be acknowledged');
  expectEqual(G('RA.isHost()'), false, 'another device leads, so this one does not run the companion');
  G("RA.send({ id: 'me-10', t: 3, dev: S.settings.deviceId, hero: 'left', type: 'flag.set', payload: { flag: 'sent-live' } })");
  await until(() => G('FakeRoomSocket.log.some(e => e.action.id === "me-10")'), 2000, 'the room to log the action');
  expectEqual(G('window.__statuses'), ['offline', 'connecting', 'live'], 'status went offline, connecting, live');
  G('RA.close()');
});
