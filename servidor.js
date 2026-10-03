/* Servidor estático simples para visualizar o site localmente.
   Uso:  node servidor.js     →  http://localhost:4173            */
const http = require('http');
const fs   = require('fs');
const path = require('path');

const RAIZ  = path.join(__dirname, 'site');
const PORTA = process.env.PORT || 4173;

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webp': 'image/webp',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.mp4':  'video/mp4',
  '.webm': 'video/webm',
  '.glb':  'model/gltf-binary',
  '.wasm': 'application/wasm'
};

http.createServer(function (req, res) {
  let rel = decodeURIComponent(req.url.split('?')[0]);
  if (rel === '/') rel = '/index.html';

  const arq = path.resolve(RAIZ, '.' + rel);
  if (!arq.startsWith(RAIZ)) { res.writeHead(403).end('403'); return; }

  fs.readFile(arq, function (err, buf) {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 — ' + rel);
      return;
    }
    res.writeHead(200, {
      'Content-Type': TIPOS[path.extname(arq).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(buf);
  });
}).listen(PORTA, function () {
  console.log('Barbearia do Carneiro → http://localhost:' + PORTA);
});
