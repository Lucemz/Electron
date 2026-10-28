const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
};

function startStaticServer(distPath) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      let reqUrl = req.url.split('?')[0];
      if (reqUrl === '/' || reqUrl === '') {
        reqUrl = '/index.html';
      }

      const safePath = path.normalize(reqUrl).replace(/^(\.\.[\/\\])+/, '');
      const filePath = path.join(distPath, safePath);

      fs.readFile(filePath, (err, content) => {
        if (err) {
          fs.readFile(path.join(distPath, 'index.html'), (errIndex, indexContent) => {
            if (errIndex) {
              res.writeHead(404, { 'Content-Type': 'text/plain' });
              res.end('Not Found');
            } else {
              res.writeHead(200, {
                'Content-Type': 'text/html; charset=utf-8',
                'Access-Control-Allow-Origin': '*',
              });
              res.end(indexContent);
            }
          });
          return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
        });
        res.end(content);
      });
    });

    // Listen on localhost for trusted browser origin
    server.listen(0, 'localhost', () => {
      const port = server.address().port;
      console.log(`[Aura Server] Local static server active on http://localhost:${port}`);
      resolve({ port, server });
    });

    server.on('error', (err) => {
      console.error('[Aura Server] Failed to start on localhost, falling back to 127.0.0.1:', err);
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        resolve({ port, server });
      });
    });
  });
}

module.exports = { startStaticServer };
