import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { createLogger } from './handlers/_common/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env from the monorepo root so all workspaces share one .env file
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const log = createLogger('server');

const PORT = parseInt(process.env.PORT || '3000', 10);
const API_DIR = '/api';
const HANDLERS_DIR = path.join(__dirname, 'handlers');
const STATIC_DIR = path.join(__dirname, 'static');
const APP_DIST = process.env.APP_STATIC_DIR || path.resolve(__dirname, '..', 'app', 'dist');
const APP_INDEX = path.join(APP_DIST, 'index.html');

// Tells middleware to use the express-style handler signature
process.env.WC_SERVER = 'true';

const app = express();

// Honour TRUST_PROXY when set, parsing booleans and integer hop counts
const trustProxy = process.env.TRUST_PROXY;
if (trustProxy) {
  const parsed = /^\d+$/.test(trustProxy)
    ? parseInt(trustProxy, 10)
    : trustProxy === 'true'
      ? true
      : trustProxy === 'false'
        ? false
        : trustProxy;
  app.set('trust proxy', parsed);
}

app.use(cors({ origin: process.env.API_CORS_ORIGIN || '*' }));

const RATE_LIMITS = [
  { window: 10 * 60, max: 100, label: '10 minutes' },
  { window: 60 * 60, max: 250, label: '1 hour' },
  { window: 12 * 60 * 60, max: 500, label: '12 hours' },
];

const rateLimitMessage = (label) =>
  `You've been rate-limited, please try again in ${label}.\n` +
  'This keeps the service running smoothly for everyone. ' +
  'You can get around these limits by running your own instance of Web Check.';

if (process.env.API_ENABLE_RATE_LIMIT === 'true') {
  for (const limit of RATE_LIMITS) {
    app.use(
      API_DIR,
      rateLimit({
        windowMs: limit.window * 1000,
        limit: limit.max,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: rateLimitMessage(limit.label) },
      }),
    );
  }
}

const handlers = {};

// Discover and dynamically import every handler module under ./handlers
const loadHandlers = async () => {
  const entries = await fs.promises.readdir(HANDLERS_DIR, { withFileTypes: true });
  const files = entries.filter((e) => e.isFile() && e.name.endsWith('.js'));
  await Promise.all(
    files.map(async (entry) => {
      const route = `${API_DIR}/${entry.name.replace(/\.js$/, '')}`;
      try {
        const mod = await import(path.join(HANDLERS_DIR, entry.name));
        const handler = mod.default || mod.handler;
        if (typeof handler === 'function') handlers[route] = handler;
      } catch (err) {
        log.error(`failed to load handler ${entry.name}: ${err.message}`);
      }
    }),
  );

  for (const [route, handler] of Object.entries(handlers)) {
    app.get(route, async (req, res) => {
      try {
        await handler(req, res);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
  }
};

// Render the static placeholder template with a status message
const renderPlaceholder = async (res, msgId, logs) => {
  const messages = {
    notCompiled:
      'Looks like the GUI app has not yet been compiled.<br />' +
      'Run <code>yarn build</code> to continue, then restart the server.',
    disabledGui:
      'Web-Check API is up and running!<br />Access the endpoints at ' +
      `<a href="${API_DIR}"><code>${API_DIR}</code></a>`,
  };
  const tail = logs ? `<div class="logs"><code>${logs}</code></div>` : '';
  const body = (messages[msgId] || 'An unknown error occurred') + tail;
  try {
    const tplPath = path.join(STATIC_DIR, 'placeholder.html');
    const tpl = await fs.promises.readFile(tplPath, 'utf-8');
    res.status(500).send(tpl.replace('<!-- CONTENT -->', body));
  } catch {
    res.status(500).send(`<pre>${body}</pre>`);
  }
};

// Aggregate every handler in parallel for the bare /api endpoint
app.get(API_DIR, async (req, res) => {
  const { url } = req.query;
  const maxMs = parseInt(process.env.PUBLIC_API_TIMEOUT_LIMIT || '60000', 10);

  const runHandler = async (handler, name) => {
    let captured;
    const mockRes = { status: () => mockRes, json: (body) => (captured = body) };
    let timer;
    const timeout = new Promise((resolve) => {
      timer = setTimeout(() => {
        const seconds = maxMs / 1000;
        resolve({ error: `Timed out after ${seconds} seconds, when executing ${name}` });
      }, maxMs);
    });
    const work = handler({ ...req, query: { url } }, mockRes)
      .then(() => captured)
      .catch((err) => ({ error: err.message }));
    const result = await Promise.race([work, timeout]);
    clearTimeout(timer);
    return result;
  };

  const results = {};
  await Promise.all(
    Object.entries(handlers).map(async ([route, handler]) => {
      const name = route.replace(`${API_DIR}/`, '');
      results[name] = await runHandler(handler, name);
    }),
  );
  res.json(results);
});

await loadHandlers();

const guiDisabled = process.env.DISABLE_GUI && process.env.DISABLE_GUI !== 'false';
const guiAvailable = !guiDisabled && fs.existsSync(APP_INDEX);

// Redirect bare root to the React app, unless the GUI has been disabled
app.get('/', (_req, res) => {
  if (guiDisabled) return renderPlaceholder(res, 'disabledGui');
  if (!guiAvailable) return renderPlaceholder(res, 'notCompiled');
  res.redirect(302, '/check');
});

if (guiAvailable) {
  app.use(express.static(APP_DIST, { index: false }));
  // SPA fallback: serve app shell for /check, redirect other paths to it
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith(`${API_DIR}/`)) return next();
    if (req.path === '/check' || req.path.startsWith('/check/')) {
      return res.sendFile(APP_INDEX);
    }
    res.redirect(302, '/check');
  });
}

// Final fallback for unmatched paths
app.use((req, res) => {
  if (req.path.startsWith(`${API_DIR}/`)) {
    res.status(404).json({ error: 'Not found' });
  } else if (!guiAvailable) {
    renderPlaceholder(res, 'notCompiled');
  } else {
    res.status(404).sendFile(path.join(STATIC_DIR, 'error.html'));
  }
});

const banner = () => {
  process.stdout.write(
    '\x1b[36m\n' +
      '    __      __   _         ___ _           _   \n' +
      '    \\ \\    / /__| |__ ___ / __| |_  ___ __| |__\n' +
      "     \\ \\/\\/ / -_) '_ \\___| (__| ' \\/ -_) _| / /\n" +
      '      \\_/\\_/\\___|_.__/    \\___|_||_\\___\\__|_\\_\\\n' +
      '\x1b[0m\n' +
      `\x1b[1m\x1b[32mWeb-Check is up and running at ` +
      `http://localhost:${PORT}\x1b[0m\n` +
      '\x1b[2m\x1b[36m  https://github.com/lissy93/web-check\x1b[0m\n\n',
  );
};

app.listen(PORT, banner);
