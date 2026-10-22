/**
 * Verdara Intelligence — Questionnaire server
 * Zero dependencies. Node 18+.
 *
 *   npm start                  → http://localhost:3000
 *   ADMIN_PASSWORD=...         → password for /admin
 *   DATA_DIR=/data             → where submissions are stored
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'verdara-admin';
const USING_DEFAULT_PASSWORD = !process.env.ADMIN_PASSWORD;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const SUBMISSION_DIR = path.join(DATA_DIR, 'submissions');
const PUBLIC_DIR = path.join(__dirname, 'public');

fs.mkdirSync(SUBMISSION_DIR, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.pdf': 'application/pdf'
};

const CSV_COLUMNS = [
  ['q1', '1. How a sale is recorded'],
  ['q2', '2. Where product and stock information lives'],
  ['q3', '3. Biggest business difficulties'],
  ['q4', '4. Tracking income, expenses, cash and bookkeeping'],
  ['q5', '5. Financial information wanted instantly'],
  ['q6', '6. Sales or orders per day'],
  ['q7', '7. How stock availability is known'],
  ['q8', '8. Stock problems to solve'],
  ['q9', '9. Tracking orders, deposits and remaining payments'],
  ['q10', '10. Tasks wanted from AI'],
  ['q11', '11. How much control AI should have'],
  ['q12', '12. What would make the system valuable — and what could block adoption'],
  ['q13', '13. First thing on the dashboard'],
  ['q14', '14. Top three priorities'],
  ['q15', '15. Software or files to connect'],
  ['q16', '16. Preferred language'],
  ['comments', 'Additional comments or ideas']
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    "connect-src 'self' https://formspree.io https://api.web3forms.com",
    "form-action 'self'",
    "base-uri 'none'",
    "frame-ancestors 'none'"
  ].join('; ')
};

function writeHead(res, status, headers = {}) {
  res.writeHead(status, { ...SECURITY_HEADERS, ...headers });
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  writeHead(res, status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function sendText(res, status, text, extra = {}) {
  writeHead(res, status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(text),
    ...extra
  });
  res.end(text);
}

function sendFile(res, filePath, { cache = 'no-cache', download = null } = {}) {
  fs.readFile(filePath, (err, buffer) => {
    if (err) {
      sendText(res, err.code === 'ENOENT' ? 404 : 500, err.code === 'ENOENT' ? 'Not found' : 'Server error');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const headers = {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Content-Length': buffer.length,
      'Cache-Control': cache
    };
    if (download) headers['Content-Disposition'] = `attachment; filename="${download}"`;
    writeHead(res, 200, headers);
    res.end(buffer);
  });
}

function hash(value) {
  return crypto.createHash('sha256').update(String(value)).digest();
}

function isAuthorized(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Basic ')) return false;
  let decoded = '';
  try {
    decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
  } catch {
    return false;
  }
  const separator = decoded.indexOf(':');
  const password = separator === -1 ? '' : decoded.slice(separator + 1);
  return crypto.timingSafeEqual(hash(password), hash(ADMIN_PASSWORD));
}

function requireAuth(req, res) {
  if (isAuthorized(req)) return true;
  writeHead(res, 401, {
    'Content-Type': 'text/html; charset=utf-8',
    'WWW-Authenticate': 'Basic realm="Verdara Intelligence Admin", charset="UTF-8"',
    'Cache-Control': 'no-store'
  });
  res.end('<h1>401 — Authentication required</h1><p>Enter the admin password to view responses.</p>');
  return false;
}

function readBody(req, limit = 200 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(Object.assign(new Error('Payload too large'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', (error) => reject(error));
  });
}

function cleanString(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.replace(/\u0000/g, '').trim().slice(0, maxLength);
}

function cleanAnswer(value) {
  if (typeof value === 'string') return cleanString(value, 4000);
  if (Array.isArray(value)) {
    return value
      .slice(0, 30)
      .map((item) => cleanString(item, 1000))
      .filter(Boolean);
  }
  return '';
}

function answerIsEmpty(value) {
  return Array.isArray(value) ? value.length === 0 : !value;
}

/* ------------------------------------------------------------------ */
/* Rate limiting (simple in-memory)                                    */
/* ------------------------------------------------------------------ */

const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT = 15;
const rateBuckets = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const hits = (rateBuckets.get(ip) || []).filter((time) => now - time < RATE_WINDOW_MS);
  hits.push(now);
  rateBuckets.set(ip, hits);
  if (rateBuckets.size > 5000) {
    for (const [key, times] of rateBuckets) {
      if (!times.some((time) => now - time < RATE_WINDOW_MS)) rateBuckets.delete(key);
    }
  }
  return hits.length > RATE_LIMIT;
}

/* ------------------------------------------------------------------ */
/* Submissions                                                         */
/* ------------------------------------------------------------------ */

function submissionFiles() {
  return fs
    .readdirSync(SUBMISSION_DIR)
    .filter((name) => name.endsWith('.json'))
    .map((name) => path.join(SUBMISSION_DIR, name));
}

function readSubmission(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function listSubmissions() {
  return submissionFiles()
    .map(readSubmission)
    .filter(Boolean)
    .sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)));
}

function csvCell(value) {
  let text = Array.isArray(value) ? value.join('; ') : String(value ?? '');
  // Prevent spreadsheet formula injection.
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function buildCsv(submissions) {
  const header = ['Respondent', 'Role', 'Submitted at', 'Duration (minutes)', ...CSV_COLUMNS.map(([, label]) => label)];
  const rows = submissions.map((entry) => {
    const answers = entry.answers || {};
    const duration = entry.durationSeconds ? (entry.durationSeconds / 60).toFixed(1) : '';
    return [
      entry.respondent?.name || '',
      entry.respondent?.role || '',
      entry.submittedAt || '',
      duration,
      ...CSV_COLUMNS.map(([key]) => answers[key] ?? '')
    ]
      .map(csvCell)
      .join(',');
  });
  return `\uFEFF${[header.map(csvCell).join(','), ...rows].join('\r\n')}\r\n`;
}

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */

async function handleSubmit(req, res) {
  const ip = req.socket.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    sendJson(res, 429, { ok: false, error: 'Too many submissions. Please try again later.' });
    return;
  }

  let body;
  try {
    body = await readBody(req);
  } catch (error) {
    sendJson(res, error.status || 400, { ok: false, error: 'Could not read the submission.' });
    return;
  }

  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    sendJson(res, 400, { ok: false, error: 'Invalid JSON.' });
    return;
  }

  if (!payload || typeof payload !== 'object' || !payload.answers || typeof payload.answers !== 'object') {
    sendJson(res, 400, { ok: false, error: 'Missing answers.' });
    return;
  }

  // Honeypot — silently accept bots without storing anything.
  if (cleanString(payload.company_website || '', 200)) {
    sendJson(res, 200, { ok: true, id: null });
    return;
  }

  const answers = {};
  for (const [key, value] of Object.entries(payload.answers)) {
    if (!/^[a-z0-9_]{1,40}$/i.test(key)) continue;
    const cleaned = cleanAnswer(value);
    if (!answerIsEmpty(cleaned)) answers[key] = cleaned;
  }

  if (!Object.keys(answers).length) {
    sendJson(res, 400, { ok: false, error: 'No answers were received.' });
    return;
  }

  const name = cleanString(payload.respondent?.name || '', 120);
  const role = cleanString(payload.respondent?.role || '', 120);
  const id = crypto.randomUUID();
  const submittedAt = new Date().toISOString();
  const durationSeconds = Number.isFinite(Number(payload.durationSeconds))
    ? Math.max(0, Math.min(60 * 60 * 6, Math.round(Number(payload.durationSeconds))))
    : null;

  const entry = {
    id,
    submittedAt,
    respondent: { name, role },
    durationSeconds,
    startedAt: cleanString(payload.startedAt || '', 40) || null,
    answers,
    meta: {
      userAgent: cleanString(req.headers['user-agent'] || '', 400),
      language: cleanString(payload.language || '', 20),
      version: 1
    }
  };

  const fileName = `${submittedAt.replace(/[:.]/g, '-')}__${id}.json`;
  fs.writeFileSync(path.join(SUBMISSION_DIR, fileName), JSON.stringify(entry, null, 2), 'utf8');

  sendJson(res, 200, { ok: true, id });
}

function handleApi(req, res, pathname) {
  if (pathname === '/api/submit' && req.method === 'POST') {
    handleSubmit(req, res).catch((error) => {
      console.error('Submit error:', error);
      if (!res.headersSent) sendJson(res, 500, { ok: false, error: 'Could not save the submission.' });
    });
    return true;
  }

  if (pathname === '/api/health' && req.method === 'GET') {
    sendJson(res, 200, { ok: true, service: 'verdara-questionnaire' });
    return true;
  }

  if (pathname === '/api/submissions' && req.method === 'GET') {
    if (!requireAuth(req, res)) return true;
    sendJson(res, 200, { ok: true, submissions: listSubmissions() });
    return true;
  }

  if (pathname === '/api/submissions.csv' && req.method === 'GET') {
    if (!requireAuth(req, res)) return true;
    const csv = buildCsv(listSubmissions());
    const date = new Date().toISOString().slice(0, 10);
    writeHead(res, 200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="verdara-questionnaire-${date}.csv"`,
      'Cache-Control': 'no-store'
    });
    res.end(csv);
    return true;
  }

  const deleteMatch = pathname.match(/^\/api\/submissions\/([a-f0-9-]{36})$/);
  if (deleteMatch && req.method === 'DELETE') {
    if (!requireAuth(req, res)) return true;
    const file = submissionFiles().find((filePath) => {
      const entry = readSubmission(filePath);
      return entry && entry.id === deleteMatch[1];
    });
    if (!file) {
      sendJson(res, 404, { ok: false, error: 'Not found.' });
      return true;
    }
    fs.unlinkSync(file);
    sendJson(res, 200, { ok: true });
    return true;
  }

  return false;
}

function serveStatic(req, res, pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    sendText(res, 400, 'Bad request');
    return;
  }

  const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const filePath = path.resolve(PUBLIC_DIR, relative);
  const publicRoot = path.resolve(PUBLIC_DIR) + path.sep;

  if (!filePath.startsWith(publicRoot)) {
    sendText(res, 403, 'Forbidden');
    return;
  }

  if (path.basename(filePath).startsWith('.')) {
    sendText(res, 404, 'Not found');
    return;
  }

  // Never serve the private dashboard through the static handler.
  if (path.basename(filePath).toLowerCase() === 'admin.html') {
    sendText(res, 404, 'Not found');
    return;
  }

  // Small site: always revalidate so edits and deploys show up immediately.
  const cache = 'no-cache';

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      sendText(res, 404, 'Not found');
      return;
    }
    sendFile(res, filePath, { cache });
  });
}

const server = http.createServer((req, res) => {
  let pathname;
  try {
    // Collapse leading slashes so "//admin.html" cannot be parsed as a new authority.
    const target = (req.url || '/').replace(/^\/+/, '/');
    pathname = new URL(target, `http://${req.headers.host || 'localhost'}`).pathname;
  } catch {
    sendText(res, 400, 'Bad request');
    return;
  }

  if (pathname === '/admin' || pathname === '/admin/' || pathname === '/admin.html') {
    if (!requireAuth(req, res)) return;
    sendFile(res, path.join(PUBLIC_DIR, 'admin.html'), { cache: 'no-store' });
    return;
  }

  if (pathname.startsWith('/api/')) {
    try {
      if (!handleApi(req, res, pathname)) {
        sendJson(res, 404, { ok: false, error: 'Not found.' });
      }
    } catch (error) {
      console.error('API error:', error);
      if (!res.headersSent) sendJson(res, 500, { ok: false, error: 'Server error.' });
    }
    return;
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    serveStatic(req, res, pathname);
    return;
  }

  sendText(res, 405, 'Method not allowed');
});

server.listen(PORT, HOST, () => {
  console.log('');
  console.log('  VERDARA INTELLIGENCE — Questionnaire');
  console.log('  ------------------------------------');
  console.log(`  Questionnaire : http://localhost:${PORT}`);
  console.log(`  Dashboard     : http://localhost:${PORT}/admin`);
  console.log(`  Data folder   : ${SUBMISSION_DIR}`);
  if (USING_DEFAULT_PASSWORD) {
    console.log('');
    console.log('  ⚠  ADMIN_PASSWORD is not set. Using the default password: verdara-admin');
    console.log('     Set ADMIN_PASSWORD before sharing the link publicly.');
  }
  console.log('');
});
