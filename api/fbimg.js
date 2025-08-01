module.exports = async (req, res) => {
  const page = req.query.page; // e.g., "nasa" for https://facebook.com/nasa

  if (!page) {
    res.statusCode = 400;
    res.end('Missing ?page= parameter');
    return;
  }

  const fbURL = `https://www.facebook.com/${page}`;

  try {
    const response = await fetch(fbURL, {
      headers: {
        'User-Agent': 'Mozilla/5.0' // mimic browser
      }
    });

    if (!response.ok) {
      res.statusCode = 500;
      res.end('Failed to fetch Facebook page');
      return;
    }

    const html = await response.text();

    // Very basic image URL extraction (may need updates if FB changes HTML)
    const imageRegex = /"image":{"uri":"(https:\\/\\/scontent[^"]+)"/g;
    const matches = [...html.matchAll(imageRegex)];

    const imageUrls = matches.map(m => m[1].replace(/\\\//g, '/'));

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ count: imageUrls.length, images: imageUrls });
  } catch (err) {
    res.statusCode = 500;
    res.end('Error: ' + err.message);
  }
};
