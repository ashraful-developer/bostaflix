// api/proxy.js
export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send('Missing URL');
  }

  try {
    const decodedUrl = decodeURIComponent(url);
    const response = await fetch(decodedUrl);

    if (!response.ok) {
      return res.status(response.status).send('Failed to fetch content.');
    }

    const content = await response.text();

    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(content);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy error occurred.');
  }
}
