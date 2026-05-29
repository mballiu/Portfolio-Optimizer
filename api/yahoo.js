import https from 'https';

export default function handler(req, res) {
  return new Promise((resolve) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      const subpath = url.pathname.replace(/^\/api\/yahoo\//, '');
      const qs = url.searchParams.toString();
      const proxyPath = `/v8/finance/${subpath}${qs ? '?' + qs : ''}`;

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
          resolve();
        });
      }).on('error', (err) => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
        resolve();
      });
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
      resolve();
    }
  });
}
