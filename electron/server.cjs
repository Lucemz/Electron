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

function startStaticServer(distPath, onSaveCookies) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const parsedUrl = new URL(req.url, 'http://localhost');
      const pathname = parsedUrl.pathname;

      // Enable CORS for localhost / browser interaction
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      // API Endpoint: Save session cookies from external browser
      if (pathname === '/api/save-cookies' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const cookies = data.cookies || '';
            if (onSaveCookies && cookies) {
              await onSaveCookies(cookies);
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Cookies guardadas exitosamente en Aura' }));
          } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: e.message }));
          }
        });
        return;
      }

      // Browser Sync Helper Page
      if (pathname === '/sync-login') {
        const queryCookies = parsedUrl.searchParams.get('cookies');
        if (queryCookies && onSaveCookies) {
          onSaveCookies(queryCookies);
        }

        const syncHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Aura Music - Conectar Cuenta de YouTube</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      background: #0a0a0f;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      box-sizing: border-box;
    }
    .card {
      background: rgba(22, 22, 30, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      padding: 36px;
      max-width: 520px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(99, 102, 241, 0.2);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid rgba(99, 102, 241, 0.4);
      color: #818cf8;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.05em;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 8px;
      color: #ffffff;
    }
    p {
      color: #94a3b8;
      font-size: 14px;
      line-height: 1.6;
      margin: 0 0 24px;
    }
    .step {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .step-title {
      font-size: 13px;
      font-weight: 600;
      color: #38bdf8;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      background: #6366f1;
      color: white;
      border: none;
      border-radius: 12px;
      padding: 12px 20px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);
      box-sizing: border-box;
    }
    .btn:hover {
      background: #4f46e5;
      transform: translateY(-1px);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: none;
      color: #cbd5e1;
      margin-top: 10px;
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
    }
    textarea {
      width: 100%;
      background: #0f0f15;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      color: #e2e8f0;
      padding: 10px;
      font-size: 12px;
      font-family: monospace;
      margin-bottom: 12px;
      box-sizing: border-box;
      resize: vertical;
      min-height: 60px;
    }
    .status {
      margin-top: 16px;
      padding: 12px;
      border-radius: 12px;
      font-size: 13px;
      display: none;
    }
    .status.success {
      display: block;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">AURA LINK</div>
    <h1>Conectar con tu Navegador</h1>
    <p>Aura se conecta con la sesión que ya tienes iniciada en YouTube Music en este navegador, sin necesidad de ingresar contraseñas.</p>

    <div class="step">
      <div class="step-title">Opción 1: Sincronización Automática con 1 clic</div>
      <p style="font-size: 12px; margin-bottom: 12px;">Arrastra este botón a tu barra de marcadores. Luego entra a YouTube Music y haz clic en él:</p>
      <a class="btn" href="javascript:(function(){fetch('${parsedUrl.origin}/api/save-cookies',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cookies:document.cookie})}).then(r=>r.json()).then(d=>{alert('¡Sesión vinculada con éxito en Aura!');window.close();}).catch(e=>{alert('Error: '+e);});})();">
        ★ Sincronizar con Aura
      </a>
      <a href="https://music.youtube.com" target="_blank" class="btn btn-secondary">
        Abrir YouTube Music ↗
      </a>
    </div>

    <div class="step">
      <div class="step-title">Opción 2: Pegar Cookies Manualmente</div>
      <p style="font-size: 12px; margin-bottom: 8px;">Si prefieres, copia tus cookies de YouTube Music y pégalas aquí:</p>
      <textarea id="cookiesInput" placeholder="SAPISID=...; HSID=...;"></textarea>
      <button class="btn btn-secondary" onclick="enviarCookies()">Vincular Cookies</button>
    </div>

    <div id="statusBox" class="status"></div>
  </div>

  <script>
    async function enviarCookies() {
      const cookies = document.getElementById('cookiesInput').value.trim();
      const statusBox = document.getElementById('statusBox');
      if (!cookies) return;
      try {
        const res = await fetch('${parsedUrl.origin}/api/save-cookies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cookies })
        });
        const data = await res.json();
        if (data.success) {
          statusBox.className = 'status success';
          statusBox.textContent = '¡Sesión vinculada correctamente! Ya puedes regresar a Aura.';
        }
      } catch (err) {
        alert('Error al conectar: ' + err.message);
      }
    }
  </script>
</body>
</html>`;

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(syncHtml);
        return;
      }

      let reqUrl = pathname;
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
