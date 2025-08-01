const https = require('https');

module.exports = async (req, res) => {
  const page = req.query.page;

  if (!page) {
    res.statusCode = 400;
    res.end('Missing ?page= parameter');
    return;
  }

  const url = `https://www.facebook.com/${page}`;
  const imageUrls = [];
  let timedOut = false;

  const timeoutMs = 8000;

  const request = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (fbRes) => {
    let html = '';

    fbRes.on('data', (chunk) => {
      if (timedOut) return;
      html += chunk.toString();

      // Extract image URLs incrementally
      const matches = [...chunk.toString().matchAll(/<img[^>]+src="(https:\/\/scontent[^">]+)"/g)];
      for (const match of matches) {
        imageUrls.push(match[1]);
      }
    });

    fbRes.on('end', () => {
      if (timedOut) return;
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify({ timeout: false, count: imageUrls.length, images: imageUrls }));
    });
  });

  request.on('error', (e) => {
    if (!timedOut) {
      res.statusCode = 500;
      res.end('Fetch error: ' + e.message);
    }
  });

  // Kill the request after timeout
  setTimeout(() => {
    timedOut = true;
    request.destroy();

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({ timeout: true, count: imageUrls.length, images: imageUrls }));
  }, timeoutMs);
};
