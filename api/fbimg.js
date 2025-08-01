const https = require('https');

module.exports = (req, res) => {
  const page = req.query.page;
  if (!page) {
    res.statusCode = 400;
    res.end('Missing ?page= parameter');
    return;
  }

  const url = `https://www.facebook.com/${page}`;
  const imageUrls = new Set();
  const timeoutMs = 8000;
  let timedOut = false;

  const timeout = setTimeout(() => {
    timedOut = true;
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({
      timeout: true,
      count: imageUrls.size,
      images: [...imageUrls]
    }));
  }, timeoutMs);

  const request = https.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  }, (fbRes) => {
    let data = [];

    fbRes.on('data', (chunk) => {
      if (!timedOut) data.push(chunk);
    });

    fbRes.on('end', () => {
      if (timedOut) return;

      clearTimeout(timeout);
      const html = Buffer.concat(data).toString();

      try {
        // Match <img src="...">
        const matches1 = [...html.matchAll(/<img[^>]+src="(https:\/\/scontent[^">]+)"/g)];
        matches1.forEach(m => imageUrls.add(m[1]));

        // Match image JSON format
        const matches2 = [...html.matchAll(/"image":\{"uri":"(https:\\/\\/scontent[^"]+)"\}/g)];
        matches2.forEach(m => imageUrls.add(m[1].replace(/\\\//g, '/')));
      } catch (err) {
        // Do nothing, just fall through
      }

      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify({
        timeout: false,
        count: imageUrls.size,
        images: [...imageUrls]
      }));
    });
  });

  request.on('error', (e) => {
    if (timedOut) return;
    clearTimeout(timeout);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Fetch failed', message: e.message }));
  });
};
