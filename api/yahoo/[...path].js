import https from 'https';

export default function handler(req, res) {
  const { path } = req.query;
  const pathname = Array.isArray(path) ? path.join('/') : path || '';

  const searchParams = new URL(req.url, 'http://localhost').searchParams;
  const queryString = searchParams.toString();
  const proxyPath = `/v8/finance/${pathname}${queryString ? '?' + queryString : ''}`;

  const options = {
    hostname: 'query1.finance.yahoo.com',
    path: proxyPath,
    rejectUnauthorized: false,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
    },
  };

  https.get(options, (proxyRes) => {
    let data = '';
    proxyRes.on('data', (chunk) => { data += chunk; });
    proxyRes.on('end', () => {
      res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' });
      res.end(data);
    });
  }).on('error', () => {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Proxy error' }));
  });
}
