const crypto = require('crypto');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

// ========== WebSocket Protocol (RFC 6455) ==========

const OPCODES = { TEXT: 0x01, CLOSE: 0x08, PING: 0x09, PONG: 0x0A };
const WS_MAGIC = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

function computeAcceptKey(clientKey) {
  return crypto.createHash('sha1').update(clientKey + WS_MAGIC).digest('base64');
}

function encodeFrame(opcode, payload) {
  const fin = 0x80;
  const len = payload.length;
  let header;

  if (len < 126) {
    header = Buffer.alloc(2);
    header[0] = fin | opcode;
    header[1] = len;
  } else if (len < 65536) {
    header = Buffer.alloc(4);
    header[0] = fin | opcode;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = fin | opcode;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(len), 2);
  }

  return Buffer.concat([header, payload]);
}

function decodeFrame(buffer) {
  if (buffer.length < 2) return null;

  const secondByte = buffer[1];
  const opcode = buffer[0] & 0x0F;
  const masked = (secondByte & 0x80) !== 0;
  let payloadLen = secondByte & 0x7F;
  let offset = 2;

  if (!masked) throw new Error('Client frames must be masked');

  if (payloadLen === 126) {
    if (buffer.length < 4) return null;
    payloadLen = buffer.readUInt16BE(2);
    offset = 4;
  } else if (payloadLen === 127) {
    if (buffer.length < 10) return null;
    payloadLen = Number(buffer.readBigUInt64BE(2));
    offset = 10;
  }

  const maskOffset = offset;
  const dataOffset = offset + 4;
  const totalLen = dataOffset + payloadLen;
  if (buffer.length < totalLen) return null;

  const mask = buffer.slice(maskOffset, dataOffset);
  const data = Buffer.alloc(payloadLen);
  for (let i = 0; i < payloadLen; i++) {
    data[i] = buffer[dataOffset + i] ^ mask[i % 4];
  }

  return { opcode, payload: data, bytesConsumed: totalLen };
}

// ========== Configuration ==========

const PORT = process.env.PDLC_BRAINSTORM_PORT || (49152 + Math.floor(Math.random() * 16383));
const HOST = process.env.PDLC_HOST || '127.0.0.1';
const URL_HOST = process.env.PDLC_URL_HOST || (HOST === '127.0.0.1' ? 'localhost' : HOST);
const SESSION_DIR = process.env.PDLC_BRAINSTORM_DIR || '/tmp/pdlc-brainstorm';
const CONTENT_DIR = path.join(SESSION_DIR, 'content');
const STATE_DIR = path.join(SESSION_DIR, 'state');
const FEATURE_NAME = process.env.PDLC_BRAINSTORM_FEATURE || null;
const PROJECT_DIR = process.env.PDLC_PROJECT_DIR || null;
let ownerPid = process.env.PDLC_OWNER_PID ? Number(process.env.PDLC_OWNER_PID) : null;

// Wave 0 — portal manifest registration. The portal at localhost:7352 reads
// this file to multiplex traffic across active backends (brainstorm visual
// companion + future craft live-server). We update it on start and clear our
// entry on shutdown. Harmless when the portal isn't running.
const PORTAL_DIR = path.join(os.homedir(), '.pdlc', 'portal');
const MANIFEST_PATH = path.join(PORTAL_DIR, 'manifest.json');
const BACKEND_ID = `brainstorm-${process.pid}-${Date.now()}`;

const MIME_TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml'
};

// ========== Templates and Constants ==========

const WAITING_PAGE = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>PDLC Visual Companion</title>
<style>
  body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; background: #0d1b2a; color: #e2e8f0; }
  h1 { color: #60a5fa; }
  p { color: #94a3b8; }
</style>
</head>
<body><h1>PDLC Visual Companion</h1>
<p>Waiting for the agent to push a screen...</p></body></html>`;

const frameTemplate = fs.readFileSync(path.join(__dirname, 'frame-template.html'), 'utf-8');
const helperScript = fs.readFileSync(path.join(__dirname, 'helper.js'), 'utf-8');
const helperInjection = '<script>\n' + helperScript + '\n</script>';

// ========== Helper Functions ==========

function isFullDocument(html) {
  const trimmed = html.trimStart().toLowerCase();
  return trimmed.startsWith('<!doctype') || trimmed.startsWith('<html');
}

function wrapInFrame(content) {
  return frameTemplate.replace('<!-- CONTENT -->', content);
}

function getNewestScreen() {
  const files = fs.readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.html'))
    .map(f => {
      const fp = path.join(CONTENT_DIR, f);
      return { path: fp, mtime: fs.statSync(fp).mtime.getTime() };
    })
    .sort((a, b) => b.mtime - a.mtime);
  return files.length > 0 ? files[0].path : null;
}

// ========== Portal Manifest (Wave 0) ==========

function readPortalManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  } catch (_) {
    return { version: 1, active: null, secondary: [] };
  }
}

function writePortalManifest(m) {
  try {
    if (!fs.existsSync(PORTAL_DIR)) fs.mkdirSync(PORTAL_DIR, { recursive: true });
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(m, null, 2));
  } catch (err) {
    console.error('Failed to write portal manifest:', err.message);
  }
}

function registerWithPortal(port) {
  const entry = {
    id: BACKEND_ID,
    kind: 'brainstorm',
    port: port,
    host: HOST,
    url: `http://${URL_HOST}:${port}`,
    project: PROJECT_DIR,
    feature: FEATURE_NAME,
    started_at: new Date().toISOString(),
    owner_pid: ownerPid,
    backend_pid: process.pid
  };
  const manifest = readPortalManifest();
  // Move current active (if not us) to secondary
  if (manifest.active && manifest.active.id !== BACKEND_ID) {
    manifest.secondary = manifest.secondary || [];
    manifest.secondary.unshift(manifest.active);
  }
  manifest.active = entry;
  writePortalManifest(manifest);
}

function unregisterFromPortal() {
  const manifest = readPortalManifest();
  let changed = false;
  if (manifest.active && manifest.active.id === BACKEND_ID) {
    manifest.active = null;
    if (manifest.secondary && manifest.secondary.length > 0) {
      manifest.active = manifest.secondary.shift();
    }
    changed = true;
  }
  if (manifest.secondary) {
    const before = manifest.secondary.length;
    manifest.secondary = manifest.secondary.filter(s => s.id !== BACKEND_ID);
    if (manifest.secondary.length !== before) changed = true;
  }
  if (changed) writePortalManifest(manifest);
}

// ========== HTTP Request Handler ==========

function handleRequest(req, res) {
  touchActivity();

  // Health check endpoint — used by start-server.sh and brainstorm flow to verify server is alive
  if (req.method === 'GET' && req.url === '/health') {
    const screenCount = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.html')).length;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      uptime: Math.round((Date.now() - lastActivity) / 1000) + 's idle',
      screens: screenCount,
      clients: clients.size,
    }));
    return;
  }

  if (req.method === 'GET' && req.url === '/') {
    const screenFile = getNewestScreen();
    let html = screenFile
      ? (raw => isFullDocument(raw) ? raw : wrapInFrame(raw))(fs.readFileSync(screenFile, 'utf-8'))
      : WAITING_PAGE;

    if (html.includes('</body>')) {
      html = html.replace('</body>', helperInjection + '\n</body>');
    } else {
      html += helperInjection;
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  } else if (req.method === 'GET' && req.url === '/html2canvas.umd.js') {
    // Wave 7b: vendored html2canvas (MIT, Niklas von Hertzen). Served from
    // scripts/ alongside server.cjs. The frame template loads this for the
    // annotation overlay's screenshot capture.
    const filepath = path.join(__dirname, 'html2canvas.umd.js');
    if (!fs.existsSync(filepath)) {
      res.writeHead(404);
      res.end('html2canvas.umd.js not found in scripts/ — annotation screenshot will not work.');
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    });
    res.end(fs.readFileSync(filepath));
  } else if (req.method === 'GET' && req.url.startsWith('/files/')) {
    const fileName = req.url.slice(7);
    const filePath = path.join(CONTENT_DIR, path.basename(fileName));
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(fs.readFileSync(filePath));
  } else if (req.method === 'POST' && req.url === '/annotation') {
    // Wave 7: annotation strokes + comment pins from the browser overlay.
    // Body: {timestamp, screen_url, screen_size, scroll_top, strokes, comments, screenshot?}
    // Wrote to: $STATE_DIR/annotations/annotation-<timestamp>.json (full payload)
    //           $STATE_DIR/events JSONL (summary line)
    const MAX_BODY = 8 * 1024 * 1024; // 8MB cap (allows screenshot data URLs in 7b)
    let body = '';
    let aborted = false;
    req.on('data', (chunk) => {
      if (aborted) return;
      body += chunk;
      if (body.length > MAX_BODY) {
        aborted = true;
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'payload too large' }));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (aborted) return;
      let data;
      try {
        data = JSON.parse(body);
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'invalid JSON: ' + err.message }));
        return;
      }
      if (!data || typeof data !== 'object') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'expected JSON object' }));
        return;
      }
      const ts = Number(data.timestamp) || Date.now();
      const annotationsDir = path.join(STATE_DIR, 'annotations');
      try {
        if (!fs.existsSync(annotationsDir)) fs.mkdirSync(annotationsDir, { recursive: true });
        const filename = 'annotation-' + ts + '.json';
        const filepath = path.join(annotationsDir, filename);
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));

        const summary = {
          type: 'annotation',
          timestamp: ts,
          screen_url: data.screen_url || null,
          stroke_count: Array.isArray(data.strokes) ? data.strokes.length : 0,
          comment_count: Array.isArray(data.comments) ? data.comments.length : 0,
          has_screenshot: !!data.screenshot,
          annotation_file: path.relative(STATE_DIR, filepath)
        };
        const eventsFile = path.join(STATE_DIR, 'events');
        fs.appendFileSync(eventsFile, JSON.stringify(summary) + '\n');

        touchActivity();
        console.log(JSON.stringify(Object.assign({ source: 'annotation-saved' }, summary)));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'saved', file: filename, summary }));
      } catch (err) {
        console.error('Failed to save annotation:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'save failed: ' + err.message }));
      }
    });
    req.on('error', (err) => {
      if (aborted) return;
      console.error('Annotation request error:', err.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'request error' }));
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
}

// ========== WebSocket Connection Handling ==========

const clients = new Set();

function handleUpgrade(req, socket) {
  const key = req.headers['sec-websocket-key'];
  if (!key) { socket.destroy(); return; }

  const accept = computeAcceptKey(key);
  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
    'Upgrade: websocket\r\n' +
    'Connection: Upgrade\r\n' +
    'Sec-WebSocket-Accept: ' + accept + '\r\n\r\n'
  );

  let buffer = Buffer.alloc(0);
  clients.add(socket);

  socket.on('data', (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    while (buffer.length > 0) {
      let result;
      try {
        result = decodeFrame(buffer);
      } catch (e) {
        socket.end(encodeFrame(OPCODES.CLOSE, Buffer.alloc(0)));
        clients.delete(socket);
        return;
      }
      if (!result) break;
      buffer = buffer.slice(result.bytesConsumed);

      switch (result.opcode) {
        case OPCODES.TEXT:
          handleMessage(result.payload.toString());
          break;
        case OPCODES.CLOSE:
          socket.end(encodeFrame(OPCODES.CLOSE, Buffer.alloc(0)));
          clients.delete(socket);
          return;
        case OPCODES.PING:
          socket.write(encodeFrame(OPCODES.PONG, result.payload));
          break;
        case OPCODES.PONG:
          break;
        default: {
          const closeBuf = Buffer.alloc(2);
          closeBuf.writeUInt16BE(1003);
          socket.end(encodeFrame(OPCODES.CLOSE, closeBuf));
          clients.delete(socket);
          return;
        }
      }
    }
  });

  socket.on('close', () => clients.delete(socket));
  socket.on('error', () => clients.delete(socket));
}

function handleMessage(text) {
  let event;
  try {
    event = JSON.parse(text);
  } catch (e) {
    console.error('Failed to parse WebSocket message:', e.message);
    return;
  }
  touchActivity();
  console.log(JSON.stringify({ source: 'user-event', ...event }));
  if (event.choice) {
    const eventsFile = path.join(STATE_DIR, 'events');
    fs.appendFileSync(eventsFile, JSON.stringify(event) + '\n');
  }
}

function broadcast(msg) {
  const frame = encodeFrame(OPCODES.TEXT, Buffer.from(JSON.stringify(msg)));
  for (const socket of clients) {
    try { socket.write(frame); } catch (e) { clients.delete(socket); }
  }
}

// ========== Activity Tracking ==========

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
let lastActivity = Date.now();

function touchActivity() {
  lastActivity = Date.now();
}

// ========== File Watching ==========

const debounceTimers = new Map();

// ========== Server Startup ==========

function startServer() {
  if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR, { recursive: true });
  if (!fs.existsSync(STATE_DIR)) fs.mkdirSync(STATE_DIR, { recursive: true });

  // Track known files to distinguish new screens from updates.
  // macOS fs.watch reports 'rename' for both new files and overwrites,
  // so we can't rely on eventType alone.
  const knownFiles = new Set(
    fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.html'))
  );

  const server = http.createServer(handleRequest);
  server.on('upgrade', handleUpgrade);

  const watcher = fs.watch(CONTENT_DIR, (eventType, filename) => {
    if (!filename || !filename.endsWith('.html')) return;

    if (debounceTimers.has(filename)) clearTimeout(debounceTimers.get(filename));
    debounceTimers.set(filename, setTimeout(() => {
      debounceTimers.delete(filename);
      const filePath = path.join(CONTENT_DIR, filename);

      if (!fs.existsSync(filePath)) return; // file was deleted
      touchActivity();

      if (!knownFiles.has(filename)) {
        knownFiles.add(filename);
        const eventsFile = path.join(STATE_DIR, 'events');
        if (fs.existsSync(eventsFile)) fs.unlinkSync(eventsFile);
        console.log(JSON.stringify({ type: 'screen-added', file: filePath }));
      } else {
        console.log(JSON.stringify({ type: 'screen-updated', file: filePath }));
      }

      broadcast({ type: 'reload' });
    }, 100));
  });
  watcher.on('error', (err) => console.error('fs.watch error:', err.message));

  function shutdown(reason) {
    console.log(JSON.stringify({ type: 'server-stopped', reason }));
    const infoFile = path.join(STATE_DIR, 'server-info');
    if (fs.existsSync(infoFile)) fs.unlinkSync(infoFile);
    fs.writeFileSync(
      path.join(STATE_DIR, 'server-stopped'),
      JSON.stringify({ reason, timestamp: Date.now() }) + '\n'
    );
    unregisterFromPortal();
    watcher.close();
    clearInterval(lifecycleCheck);
    server.close(() => process.exit(0));
  }

  function ownerAlive() {
    if (!ownerPid) return true;
    try { process.kill(ownerPid, 0); return true; } catch (e) { return e.code === 'EPERM'; }
  }

  // Check every 60s: exit if owner process died or idle for 30 minutes
  const lifecycleCheck = setInterval(() => {
    if (!ownerAlive()) shutdown('owner process exited');
    else if (Date.now() - lastActivity > IDLE_TIMEOUT_MS) shutdown('idle timeout');
  }, 60 * 1000);
  lifecycleCheck.unref();

  // Validate owner PID at startup. If it's already dead, the PID resolution
  // was wrong (common on WSL, Tailscale SSH, and cross-user scenarios).
  // Disable monitoring and rely on the idle timeout instead.
  if (ownerPid) {
    try { process.kill(ownerPid, 0); }
    catch (e) {
      if (e.code !== 'EPERM') {
        console.log(JSON.stringify({ type: 'owner-pid-invalid', pid: ownerPid, reason: 'dead at startup' }));
        ownerPid = null;
      }
    }
  }

  // Port retry logic — try up to 5 random ports if the first is occupied
  let attempts = 0;
  const MAX_PORT_ATTEMPTS = 5;
  let currentPort = Number(PORT);

  function tryListen() {
    server.listen(currentPort, HOST, () => {
      const info = JSON.stringify({
        type: 'server-started', port: currentPort, host: HOST,
        url_host: URL_HOST, url: 'http://' + URL_HOST + ':' + currentPort,
        screen_dir: CONTENT_DIR, state_dir: STATE_DIR
      });
      console.log(info);
      fs.writeFileSync(path.join(STATE_DIR, 'server-info'), info + '\n');
      registerWithPortal(currentPort);
    });
  }

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && attempts < MAX_PORT_ATTEMPTS) {
      attempts++;
      currentPort = 49152 + Math.floor(Math.random() * 16383);
      console.error(JSON.stringify({ type: 'port-retry', attempt: attempts, port: currentPort, reason: 'EADDRINUSE' }));
      server.close();
      tryListen();
    } else {
      console.error(JSON.stringify({ type: 'server-error', error: err.message, code: err.code }));
      fs.writeFileSync(
        path.join(STATE_DIR, 'server-stopped'),
        JSON.stringify({ reason: 'startup error: ' + err.message, timestamp: Date.now() }) + '\n'
      );
      process.exit(1);
    }
  });

  tryListen();
}

if (require.main === module) {
  // Catch uncaught exceptions — write crash info to state dir so the brainstorm flow can detect it
  process.on('uncaughtException', (err) => {
    console.error(JSON.stringify({ type: 'server-crash', error: err.message, stack: err.stack }));
    try {
      fs.writeFileSync(
        path.join(STATE_DIR, 'server-stopped'),
        JSON.stringify({ reason: 'crash: ' + err.message, timestamp: Date.now() }) + '\n'
      );
    } catch (_) {}
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    console.error(JSON.stringify({ type: 'server-unhandled-rejection', error: String(reason) }));
  });

  startServer();
}

module.exports = { computeAcceptKey, encodeFrame, decodeFrame, OPCODES };
