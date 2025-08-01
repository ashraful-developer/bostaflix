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
  let timedOut = false;
  const timeoutMs = 8000;

  const reqOptions = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  };

  const fbReq = https.get(url, reqOptions, (fbRes) => {
    let html = '';

    fbRes.on('data', (chunk) => {
      if (timedOut) return;
      const text = chunk.toString();
      html += text;

      try {
        // Match <img src="https://scontent...">
        const imgTagMatches = [...text.matchAll(/<img[^>]+src="(https:\/\/scontent[^">]+)"/g)];
        imgTagMatches.forEach(m => imageUrls.add(m[1]));

        // Match JSON-based image URL
        const jsonMatches = [...text.matchAll(/"image":\{"uri":"(https:\\/\\/scontent[^"]+)"\}/g)];
        jsonMatches.forEach(m => imageUrls.add(m[1].replace(/\\\//g, '/')));
      } catch (e) {
        // Ignore parsing errors silently
      }
    });

    fbRes.on('end', () => {
      if (timedOut) return;
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify({ timeout: false, count: imageUrls.size, images: [...imageUrls] }));
    });
  });

  fbReq.on('error', (e) => {
    if (!timedOut) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Fetch failed', message: e.message }));
    }
  });

  // Timeout to prevent crash
  setTimeout(() => {
    timedOut = true;
    fbReq.destroy(); // Abort request
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({ timeout: true, count: imageUrls.size, images: [...imageUrls] }));
  }, timeoutMs);
};
