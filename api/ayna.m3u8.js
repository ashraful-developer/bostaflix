export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing "id" parameter' });
  }

  try {
    const response = await fetch(`https://stream-cdn-bostaflix.global.ssl.fastly.net/ayna/play.php?id=${id}`);
    const html = await response.text();

    // Find the .m3u8 URL in the returned HTML
    const m3u8Match = html.match(/https?:\/\/[^"']+\.m3u8/);

    if (!m3u8Match) {
      return res.status(404).json({ error: 'No .m3u8 URL found' });
    }

    const m3u8Url = m3u8Match[0];

    // Redirect to the .m3u8 stream
    res.writeHead(302, { Location: m3u8Url });
    res.end();
  } catch (error) {
    console.error('Error fetching or parsing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
