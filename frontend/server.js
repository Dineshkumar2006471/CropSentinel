import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8080;
const PUBLIC_DIR = path.join(__dirname, 'dist');
const BACKEND_URL = process.env.VITE_API_URL || "http://localhost:8000";

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://maps.googleapis.com https://*.googleapis.com;"
};

const server = http.createServer((req, res) => {
  // If request is for /api, proxy it to the backend
  if (req.url.startsWith('/api/')) {
    const targetUrl = new URL(req.url, BACKEND_URL);
    const clientReq = targetUrl.protocol === 'https:' ? https : http;
    
    const headers = { ...req.headers };
    delete headers.host;
    
    const proxyReq = clientReq.request(
      targetUrl.href,
      {
        method: req.method,
        headers: headers,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      }
    );
    
    proxyReq.on('error', (err) => {
      console.error(`Proxy error: ${err.message}`);
      res.writeHead(502);
      res.end('Bad Gateway');
    });
    
    req.pipe(proxyReq, { end: true });
    return;
  }

  let urlPath = req.url.split('?')[0];
  let filePath = path.join(PUBLIC_DIR, urlPath);
  
  if (urlPath === '/' || urlPath.endsWith('/')) {
    filePath = path.join(filePath, 'index.html');
  }

  const extname = path.extname(filePath);
  let contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Fallback to index.html for Single Page Application client-side routing
        fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err2, indexContent) => {
          if (err2) {
            res.writeHead(500, SECURITY_HEADERS);
            res.end('Error loading index.html');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html', ...SECURITY_HEADERS });
            res.end(indexContent, 'utf-8');
          }
        });
      } else {
        res.writeHead(500, SECURITY_HEADERS);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType, ...SECURITY_HEADERS });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on port ${PORT}`);
  console.log(`Proxying /api/ to ${BACKEND_URL}`);
});
