const https = require('https');

module.exports = async (req, res) => {
  const page = req.query.page; // e.g., "nasa"

  if (!page) {
    res.statusCode = 400;
    res.end('Missing ?page= parameter');
    return;
  }

  const url = `https://www.facebook.com/${page}`;

  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (fbRes) => {
    let data = '';

    fbRes.on('data', chunk => data += chunk);
    fbRes.on('end', () => {
      try {
        // Match <img src="https://scontent...">
        const imageRegex = /<img[^>]+src="(https:\/\/scontent[^">]+)"/g;
        const matches = [...data.matchAll(imageRegex)];
        const imageUrls = matches.map(m => m[1]);

        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify({ count: imageUrls.length, images: imageUrls }));
      } catch (err) {
        res.statusCode = 500;
        res.end('Parse error: ' + err.message);
      }
    });
  }).on('error', (e) => {
    res.statusCode = 500;
    res.end('Fetch error: ' + e.message);
  });
};
