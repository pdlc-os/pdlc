#!/usr/bin/env node
// PDLC Visual Portal — bookmarkable proxy at http://localhost:7352/
//
// Multiplexes traffic across active visual backends (brainstorm visual
// companion + future craft live-server). Reads ~/.pdlc/portal/manifest.json
// to determine the active backend, proxies HTTP/WebSocket/SSE there.
//
// Reserves /portal/* — never proxied:
//   /portal/events       — SSE channel for browser auto-reload on backend swap
//   /portal/auto-reload.js — same script as inline injection, for CSP fallback
//   /portal/manifest     — current manifest JSON (read-only debug)
//   /portal/health       — portal's own health (status, active kind, sse clients)
//
// All other paths proxy to manifest.active.port if a healthy backend exists,
// otherwise show the idle page.

const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const net = require('net');

// ========== Configuration ==========

const PORT = Number(process.env.PDLC_PORTAL_PORT) || 7352;
const HOST = process.env.PDLC_PORTAL_HOST || '127.0.0.1';
const PORTAL_DIR = path.join(os.homedir(), '.pdlc', 'portal');
const MANIFEST_PATH = path.join(PORTAL_DIR, 'manifest.json');
const PORTAL_INFO_PATH = path.join(PORTAL_DIR, 'portal-info.json');
const HEALTH_TIMEOUT_MS = 1000;

// ========== State ==========

let manifest = { version: 1, active: null, secondary: [] };
const sseClients = new Set();
let prevActiveId = null;

// ========== Auto-reload script (5-second cancellable banner) ==========
//
// Per plan §10.6 Q7 — banner from day one. Input loss is a worse failure mode
// than a small UI element. Cancel button preserves in-flight user input.
const AUTO_RELOAD_BODY = `(function(){
  try {
    var es = new EventSource('/portal/events');
    es.onmessage = function(e){
      var msg; try { msg = JSON.parse(e.data); } catch(_) { return; }
      if (msg.type !== 'backend-changed') return;
      var b = document.createElement('div');
      b.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#1e4db7;color:#fff;padding:12px 16px;font-family:system-ui,sans-serif;text-align:center;z-index:99999;box-shadow:0 4px 16px rgba(0,0,0,0.2);font-size:14px';
      b.innerHTML = 'PDLC backend switched to <b>'+(msg.to||'new')+'</b>. Reloading in <span id="pdlc-rl-c">5</span>s. <button id="pdlc-rl-r" style="margin-left:8px;padding:4px 12px;border-radius:4px;border:1px solid rgba(255,255,255,0.5);background:rgba(255,255,255,0.1);color:#fff;cursor:pointer;font-family:inherit;font-size:inherit">Reload now</button> <button id="pdlc-rl-x" style="margin-left:4px;padding:4px 12px;border-radius:4px;border:1px solid rgba(255,255,255,0.5);background:transparent;color:#fff;cursor:pointer;font-family:inherit;font-size:inherit">Cancel</button>';
      document.body.appendChild(b);
      var c = 5;
      var t = setInterval(function(){ c--; var el=document.getElementById('pdlc-rl-c'); if(el) el.textContent=c; if(c<=0){ clearInterval(t); location.reload(); } }, 1000);
      document.getElementById('pdlc-rl-r').onclick = function(){ clearInterval(t); location.reload(); };
      document.getElementById('pdlc-rl-x').onclick = function(){ clearInterval(t); b.remove(); };
    };
  } catch(e) { /* SSE not supported or blocked */ }
})();`;
const AUTO_RELOAD_INLINE = `<script>${AUTO_RELOAD_BODY}</script>`;

// ========== Manifest read + watch ==========

function readManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  } catch (_) {
    return { version: 1, active: null, secondary: [] };
  }
}

function activeKind(m) {
  return (m && m.active && m.active.kind) ? m.active.kind : 'idle';
}

function activeId(m) {
  return (m && m.active && m.active.id) ? m.active.id : null;
}

function broadcastBackendChanged(toKind) {
  const data = `data: ${JSON.stringify({ type: 'backend-changed', to: toKind })}\n\n`;
  for (const res of sseClients) {
    try { res.write(data); } catch (_) { sseClients.delete(res); }
  }
}

let watchDebounce = null;
function watchManifest() {
  if (!fs.existsSync(PORTAL_DIR)) fs.mkdirSync(PORTAL_DIR, { recursive: true });
  fs.watch(PORTAL_DIR, (eventType, filename) => {
    if (filename !== 'manifest.json') return;
    clearTimeout(watchDebounce);
    watchDebounce = setTimeout(() => {
      const newManifest = readManifest();
      const newId = activeId(newManifest);
      manifest = newManifest;
      if (newId !== prevActiveId) {
        prevActiveId = newId;
        broadcastBackendChanged(activeKind(newManifest));
      }
    }, 50);
  });
}

// ========== Backend health check ==========

function checkBackendHealth(active) {
  return new Promise((resolve) => {
    const req = http.get({
      hostname: 'localhost',
      port: active.port,
      path: '/health',
      timeout: HEALTH_TIMEOUT_MS
    }, (res) => {
      resolve(res.statusCode === 200);
      res.resume();
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

// ========== Portal-reserved routes ==========

function handlePortalRoute(req, res) {
  if (req.method === 'GET' && req.url === '/portal/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });
    res.write(`data: ${JSON.stringify({ type: 'connected', active: activeKind(manifest) })}\n\n`);
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }
  if (req.method === 'GET' && req.url === '/portal/auto-reload.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    res.end(AUTO_RELOAD_BODY);
    return;
  }
  if (req.method === 'GET' && req.url === '/portal/manifest') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(manifest, null, 2));
    return;
  }
  if (req.method === 'GET' && req.url === '/portal/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      active: activeKind(manifest),
      sse_clients: sseClients.size,
      manifest_path: MANIFEST_PATH
    }));
    return;
  }
  res.writeHead(404);
  res.end('Portal route not found');
}

// ========== Idle page (no active backend or backend unhealthy) ==========

function renderIdlePage(hint) {
  const secondaryHTML = (manifest.secondary && manifest.secondary.length > 0)
    ? `<div class="secondary-list"><h2>Recent backends</h2>${
        manifest.secondary.map(s =>
          `<a href="${s.url}">${s.kind} (port ${s.port}${s.feature ? ', ' + s.feature : ''})</a>`
        ).join('<br>')
      }</div>`
    : '';
  const hintHTML = hint ? `<div class="hint">${hint}</div>` : '';
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>PDLC Visual Portal</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  body { font-family: 'DM Sans', Helvetica, Arial, sans-serif; padding: 4rem 2rem; max-width: 720px; margin: 0 auto; background: #fafbfb; color: #11142d; }
  h1 { color: #1e4db7; margin-bottom: 0.5rem; font-weight: 700; }
  p { color: #5A6A85; line-height: 1.6; margin-bottom: 1rem; }
  code { background: #ecf0f2; padding: 2px 6px; border-radius: 4px; font-family: 'Space Mono', monospace; font-size: 0.875em; color: #1e4db7; }
  .hint { background: #fff4e5; border-left: 3px solid #fdc90f; padding: 0.75rem 1rem; border-radius: 4px; margin-top: 1rem; color: #11142d; }
  .secondary-list { background: #fff; padding: 1rem 1.25rem; border-radius: 8px; box-shadow: 0 7px 30px rgba(90,114,123,0.11); margin-top: 1.5rem; border: 1px solid #e5eaef; }
  .secondary-list h2 { font-size: 0.875rem; color: #1e4db7; margin-bottom: 0.5rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; }
  .secondary-list a { color: #1a97f5; text-decoration: none; line-height: 1.8; }
  .secondary-list a:hover { text-decoration: underline; }
  .footer { color: #767e89; font-size: 0.8125rem; margin-top: 3rem; }
</style></head>
<body>
<h1>PDLC Visual Portal</h1>
<p>No active visual session. Start one via <code>/pdlc brainstorm</code> (mockup voting). Future <code>/pdlc craft</code> (variant generation) will appear here automatically when running.</p>
${hintHTML}
${secondaryHTML}
<p class="footer">This URL is stable across PDLC upgrades. Bookmark <code>http://localhost:${PORT}/</code> — content updates as backends start.</p>
${AUTO_RELOAD_INLINE}
</body></html>`;
}

function serveIdlePage(res, hint) {
  if (res.headersSent) return;
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(renderIdlePage(hint));
}

// ========== Proxy logic ==========

async function handleProxyRequest(req, res) {
  if (req.url.startsWith('/portal/')) {
    return handlePortalRoute(req, res);
  }
  const active = manifest.active;
  if (!active) {
    return serveIdlePage(res);
  }
  const healthy = await checkBackendHealth(active);
  if (!healthy) {
    return serveIdlePage(res, `Backend <code>${active.kind}</code> at port ${active.port} is not responding. Showing idle page.`);
  }

  const proxyOpts = {
    hostname: 'localhost',
    port: active.port,
    method: req.method,
    path: req.url,
    headers: Object.assign({}, req.headers, { host: `localhost:${active.port}` })
  };

  const upstream = http.request(proxyOpts, (upstreamRes) => {
    const headers = Object.assign({}, upstreamRes.headers);
    const ct = (headers['content-type'] || '').toLowerCase();
    const isHTML = ct.includes('text/html');

    if (isHTML) {
      // Buffer + inject auto-reload script before </body>
      const chunks = [];
      upstreamRes.on('data', (c) => chunks.push(c));
      upstreamRes.on('end', () => {
        const buf = Buffer.concat(chunks).toString('utf8');
        const injected = buf.includes('</body>')
          ? buf.replace('</body>', AUTO_RELOAD_INLINE + '\n</body>')
          : buf + AUTO_RELOAD_INLINE;
        delete headers['content-length'];
        delete headers['content-encoding']; // we already decoded, don't claim gzip
        res.writeHead(upstreamRes.statusCode, headers);
        res.end(injected);
      });
    } else {
      res.writeHead(upstreamRes.statusCode, headers);
      upstreamRes.pipe(res);
    }
  });

  upstream.on('error', (err) => {
    console.error('Proxy upstream error:', err.message);
    serveIdlePage(res, `Proxy error: ${err.message}`);
  });

  // Forward request body
  req.pipe(upstream);
  req.on('error', () => upstream.destroy());
}

// ========== WebSocket / upgrade proxy ==========

function handleProxyUpgrade(req, socket, head) {
  if (req.url.startsWith('/portal/')) {
    socket.destroy();
    return;
  }
  const active = manifest.active;
  if (!active) {
    socket.destroy();
    return;
  }
  const upstream = net.connect(active.port, 'localhost', () => {
    const headerLines = Object.entries(req.headers)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\r\n');
    upstream.write(`${req.method} ${req.url} HTTP/1.1\r\n${headerLines}\r\n\r\n`);
    if (head && head.length) upstream.write(head);
    upstream.pipe(socket);
    socket.pipe(upstream);
  });
  upstream.on('error', () => { try { socket.destroy(); } catch (_) {} });
  socket.on('error', () => { try { upstream.destroy(); } catch (_) {} });
}

// ========== Server lifecycle ==========

function writePortalInfo() {
  if (!fs.existsSync(PORTAL_DIR)) fs.mkdirSync(PORTAL_DIR, { recursive: true });
  fs.writeFileSync(PORTAL_INFO_PATH, JSON.stringify({
    type: 'portal-started',
    port: PORT,
    host: HOST,
    url: `http://localhost:${PORT}/`,
    pid: process.pid,
    started_at: new Date().toISOString()
  }, null, 2));
}

function clearPortalInfo() {
  try { fs.unlinkSync(PORTAL_INFO_PATH); } catch (_) {}
}

function startPortal() {
  manifest = readManifest();
  prevActiveId = activeId(manifest);
  watchManifest();

  const server = http.createServer(handleProxyRequest);
  server.on('upgrade', handleProxyUpgrade);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(JSON.stringify({ type: 'portal-error', error: `Port ${PORT} already in use. Set PDLC_PORTAL_PORT to override.`, code: 'EADDRINUSE' }));
      process.exit(2);
    }
    console.error(JSON.stringify({ type: 'portal-error', error: err.message, code: err.code }));
    process.exit(1);
  });

  server.listen(PORT, HOST, () => {
    writePortalInfo();
    console.log(JSON.stringify({
      type: 'portal-started',
      port: PORT,
      host: HOST,
      url: `http://localhost:${PORT}/`
    }));
  });

  function shutdown(reason) {
    console.log(JSON.stringify({ type: 'portal-stopped', reason }));
    clearPortalInfo();
    server.close(() => process.exit(0));
    // Force-exit if close hangs
    setTimeout(() => process.exit(0), 2000).unref();
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('exit', clearPortalInfo);
  process.on('uncaughtException', (err) => {
    console.error(JSON.stringify({ type: 'portal-crash', error: err.message, stack: err.stack }));
    clearPortalInfo();
    process.exit(1);
  });
}

if (require.main === module) {
  startPortal();
}

module.exports = { readManifest, activeKind, activeId, AUTO_RELOAD_BODY };
