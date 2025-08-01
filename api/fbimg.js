const https = require('https');

module.exports = async (req, res) => {
  const page = req.query.page;
  if (!page) {
    res.statusCode = 400;
    res.end('Missing ?page= parameter');
    return;
  }

  const url = `https://www.facebook.com/${page}`;
  const imageUrls = new Set();
  let timedOut = false;
  const timeoutMs = 8000;

  const request = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (fbRes) => {
    let html = '';

    fbRes.on('data', (chunk) => {
      if (timedOut) return;
      const text = chunk.toString();
      html += text;

      // Match <img src="https://scontent...">
      const tagMatches = [...text.matchAll(/<img[^>]+src="(https:\/\/scontent[^">]+)"/g)];
      tagMatches.forEach(m => imageUrls.add(m[1]));

      // Match JSON-based {"image":{"uri":"https:\/\/scontent..."}}
      const jsonMatches = [...text.matchAll(/"image":\{"uri":"(https:\\/\\/scontent[^"]+)"\}/g)];
      jsonMatches.forEach(m => imageUrls.add(m[1].replace(/\\\//g, '/')));
    });

    fbRes.on('end', () => {
      if (timedOut) return;
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify({ timeout: false, count: imageUrls.size, images: [...imageUrls] }));
    });
  });

  request.on('error', (e) => {
    if (!timedOut) {
      res.statusCode = 500;
      res.end('Fetch error: ' + e.message);
    }
  });

  setTimeout(() => {
    timedOut = true;
    request.destroy();
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({ timeout: true, count: imageUrls.size, images: [...imageUrls] }));
  }, timeoutMs);
};
