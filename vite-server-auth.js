import { createServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PASSWORD_FILE_NAME = '.sandbox-password';
const PASSWORD_FILE = path.join(__dirname, PASSWORD_FILE_NAME);
const COOKIE_NAME = 'sandbox_auth';
const COOKIE_MAX_AGE = 24 * 60 * 60; // 24 hours in seconds

// Read passwords from file (format: password=role)
let passwordRoles = {};
try {
  const content = fs.readFileSync(PASSWORD_FILE, 'utf8').trim();
  const lines = content.split('\n').filter(line => line.trim());
  lines.forEach(line => {
    const [password, role] = line.split('=').map(s => s.trim());
    if (password && role) {
      passwordRoles[password] = role;
    }
  });
  console.log(`Loaded ${Object.keys(passwordRoles).length} role passwords - auth enabled`);
} catch (err) {
  console.log('No password file found - running without authentication');
}

function createAuthMiddleware(passwordRoles) {
  return (req, res, next) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // Health check endpoint - always accessible
    if (url.pathname === '/health') {
      res.writeHead(204); // No Content
      res.end();
      return;
    }

    // If no passwords are configured, allow all access
    if (Object.keys(passwordRoles).length === 0) {
      return next();
    }

    // Auth endpoint to set cookie
    if (url.pathname === '/auth') {
      return handleAuthEndpoint(req, res, passwordRoles);
    }

    // Role check endpoint (for frontend to verify auth)
    if (url.pathname === '/api/auth/role') {
      const cookies = parseCookies(req.headers.cookie || '');
      const authCookie = cookies[COOKIE_NAME];

      if (authCookie && passwordRoles[authCookie]) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ role: passwordRoles[authCookie] }));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not authenticated' }));
      }
      return;
    }

    return next();
  };
}

function handleAuthEndpoint(req, res, passwordRoles) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');

  if (token && passwordRoles[token]) {
    const role = passwordRoles[token];
    // Set cookie with role information and redirect to root
    res.writeHead(302, {
      'Set-Cookie': `${COOKIE_NAME}=${token}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; SameSite=None`,
      'Location': `/?role=${role}`
    });
    res.end();
  } else {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid token' }));
  }
}

function sendUnauthorizedResponse(res) {
  res.writeHead(401, { 'Content-Type': 'text/plain' });
  res.end('401 - Authentication Required');
}

async function startServer() {
  const server = await createServer({
    configFile: path.join(__dirname, 'vite.config.ts'),
    root: __dirname,
  });

  // Add auth middleware at the beginning of the stack
  const authMiddleware = createAuthMiddleware(passwordRoles);

  server.middlewares.stack.unshift({
    route: '',
    handle: authMiddleware
  });

  await server.listen();

  const address = server.httpServer.address();
  console.log(`Server listening on port ${address.port}`);
}

function parseCookies(cookieString) {
  const cookies = {};
  cookieString.split(';').forEach(cookie => {
    const [key, value] = cookie.trim().split('=');
    if (key) cookies[key] = value;
  });
  return cookies;
}

startServer().catch(err => {
  console.error('Error starting server:', err);
  process.exit(1);
});