export default async function proxy(req, res) {
  const { url, server = '1' } = req.query; // Default server to '1' if not provided

  if (!url) {
    return res.status(400).send('Missing URL parameter');
  }

  try {
    // Fetch the original m3u8 file
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Referer': 'https://t.bdixtv24.com/?play=sonyaath',
        'User-Agent': 'Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.188 Safari/537.36 CrKey/1.54.250320',
      },
    });

    if (!response.ok) {
      return res.status(response.status).send('Error fetching the resource');
    }

    // Get the m3u8 content as text
    let m3u8Content = await response.text();

    // Modify URLs in the playlist
    const baseUrl = `https://tvs${server}.aynaott.com`;
    m3u8Content = m3u8Content
      .split('\n')
      .map(line => (line.startsWith('http') ? `${baseUrl}${line}` : line))
      .join('\n');

    // Send modified m3u8 file
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.status(200).send(m3u8Content);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
