const https = require('https');
const http = require('http');

const PORT = process.env.PORT || 3000;
const BCRA_BASE = 'api.bcra.gob.ar';

function fetchBCRA(path, res) {
  const options = {
    hostname: BCRA_BASE,
    path: path,
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  };

  const req = https.request(options, (bcraRes) => {
    let data = '';
    bcraRes.on('data', chunk => data += chunk);
    bcraRes.on('end', () => {
      res.writeHead(bcraRes.statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(data);
    });
  });

  req.on('error', (err) => {
    res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ error: err.message }));
  });

  req.end();
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET' });
    res.end(); return;
  }

  const parts = req.url.split('/').filter(Boolean);
  const cuit = parts[0];
  const tipo = parts[1] || 'deudas';

  if (!cuit || !/^\d{11}$/.test(cuit)) {
    res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ error: 'CUIT invalido' })); return;
  }

  if (tipo === 'cheques') {
    fetchBCRA('/centraldedeudores/v1.0/Deudas/ChequesRechazados/' + cuit, res);
  } else {
    fetchBCRA('/centraldedeudores/v1.0/Deudas/' + cuit, res);
  }
});

server.listen(PORT, () => console.log('Servidor corriendo en puerto ' + PORT));
