export default async function handler(req, res) {
  const { path } = req.query;
  const pathname = Array.isArray(path) ? path.join('/') : path || '';

  const targetUrl = new URL(pathname, 'https://query1.finance.yahoo.com/v8/finance/');

  const { searchParams } = new URL(req.url, 'http://localhost');
  searchParams.forEach((value, key) => {
    if (key !== 'path') {
      targetUrl.searchParams.set(key, value);
    }
  });

  try {
    const response = await fetch(targetUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
    });
    const data = await response.json();
    res.setHeader('Content-Type', 'application/json');
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error' });
  }
}
