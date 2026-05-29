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
    const response = await fetch(targetUrl.toString());
    const data = await response.json();
    res.setHeader('Content-Type', 'application/json');
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error' });
  }
}
