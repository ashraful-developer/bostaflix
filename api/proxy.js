export default async function proxy(req, res) {
  let { url, server = '1' } = req.query; // Default server to '1' if not provided

  if (!url) {
    return res.status(400).send('Missing URL parameter');
  }

  try {
    // Extract base path from the given URL
    const urlObject = new URL(url);
    const modifiedUrl = `https://tvs${server}.aynaott.com/${urlObject.origin}${urlObject.pathname}${urlObject.search}`;

    // Redirect the client to the modified URL
    res.redirect(302, modifiedUrl);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
