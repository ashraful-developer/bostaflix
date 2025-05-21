export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing "id" parameter' });
  }

  const targetUrl = `https://re.fredflix.fun/ayna/play.php?id=${id}`;

  try {
    const response = await fetch(targetUrl);
    const html = await response.text();

    // Extract src inside <source ... src="..." >
    const match = html.match(/<source[^>]+src="([^"]+\.m3u8[^"]*)"/);

    if (!match || !match[1]) {
      return res.status(404).json({ error: 'No .m3u8 tokenized URL found in video tag' });
    }

    const m3u8Url = match[1];

    // Redirect to the real stream
    res.writeHead(302, { Location: m3u8Url });
    res.end();
  } catch (err) {
    console.error('Fetch or parsing failed:', err);
    res.status(500).json({ error: 'Server error' });
  }
}
