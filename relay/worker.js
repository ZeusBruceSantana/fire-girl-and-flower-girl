/* Ember Bloom relay: a tiny Cloudflare Worker with one Durable Object per family world code.
   It is the "room": every device in the family joins the room for its world code over a WebSocket,
   sends its actions, and receives everyone else's. The room keeps the action log so a device that was
   away gets what it missed. It never reads names or word lists (those never leave a device) and it has
   no accounts: the 24-letter world code is the only key.

   Deploy (a grown-up, once; see docs/SETUP.md section 7):  npx wrangler deploy
   Cost: $0 on the Cloudflare free plan at family scale. */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const m = url.pathname.match(/^\/room\/([a-z0-9]{16,32})$/);
    if (!m) return new Response('Ember Bloom relay. Rooms live at /room/<world code>.', { status: 200 });
    const id = env.ROOMS.idFromName(m[1]);
    return env.ROOMS.get(id).fetch(request);
  },
};

const MAX_LOG = 5000;          // actions kept per room (a family plays a few hundred a day)

export class Room {
  constructor(state, env) {
    this.state = state; this.env = env;
    this.sockets = new Map();   // WebSocket -> { dev, seat }
    this.leadDev = null;        // the device that runs the companion (the first one connected)
  }
  async fetch(request) {
    if (request.headers.get('Upgrade') !== 'websocket') return new Response('expected websocket', { status: 426 });
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.state.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }
  async webSocketMessage(ws, raw) {
    let msg; try { msg = JSON.parse(raw); } catch (e) { return; }
    if (msg.kind === 'hello') {
      this.sockets.set(ws, { dev: msg.dev, seat: msg.seat });
      if (!this.leadDev || ![...this.sockets.values()].some(s => s.dev === this.leadDev)) this.leadDev = msg.dev;
      const seq = (await this.state.storage.get('seq')) || 0;
      const since = Number(msg.since) || 0;
      const log = (await this.state.storage.get('log')) || [];
      const missed = log.filter(e => e.seq > since).map(e => e.action);
      ws.send(JSON.stringify({ kind: 'snapshot', actions: missed, seq, lead: this.leadDev }));
      this.broadcast({ kind: 'join', seat: msg.seat, dev: msg.dev, lead: this.leadDev }, ws);
      return;
    }
    const who = this.sockets.get(ws);
    if (!who) return;
    if (msg.kind === 'action' && msg.action && msg.action.id) {
      const log = (await this.state.storage.get('log')) || [];
      if (!log.some(e => e.action.id === msg.action.id)) {
        const seq = ((await this.state.storage.get('seq')) || 0) + 1;
        log.push({ seq, action: msg.action });
        if (log.length > MAX_LOG) log.splice(0, log.length - MAX_LOG);
        await this.state.storage.put('log', log);
        await this.state.storage.put('seq', seq);
        this.broadcast({ kind: 'action', action: msg.action, seq }, ws);
        ws.send(JSON.stringify({ kind: 'ack', ids: [msg.action.id], seq }));
      } else ws.send(JSON.stringify({ kind: 'ack', ids: [msg.action.id] }));
      return;
    }
    if (msg.kind === 'presence') { this.broadcast({ kind: 'presence', seat: msg.seat, p: msg.p, from: who.dev }, ws); return; }
    if (msg.kind === 'ping') { ws.send(JSON.stringify({ kind: 'pong', lead: this.leadDev })); }
  }
  async webSocketClose(ws) { this.drop(ws); }
  async webSocketError(ws) { this.drop(ws); }
  drop(ws) {
    const who = this.sockets.get(ws);
    this.sockets.delete(ws);
    if (who && this.leadDev === who.dev) {
      const next = [...this.sockets.values()][0];
      this.leadDev = next ? next.dev : null;
      this.broadcast({ kind: 'lead', lead: this.leadDev });
    }
    if (who) this.broadcast({ kind: 'leave', seat: who.seat, dev: who.dev });
  }
  broadcast(msg, except) {
    const s = JSON.stringify(msg);
    for (const ws of this.sockets.keys()) if (ws !== except) { try { ws.send(s); } catch (e) { this.sockets.delete(ws); } }
  }
}
