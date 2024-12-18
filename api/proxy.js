export default async function proxy(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('Missing URL parameter');
  }

  try {
    // Fetch the media segment with custom headers
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Referer': 'https://playyonogames.in/play.php?id=242',
        'User-Agent': 'Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.188 Safari/537.36 CrKey/1.54.250320',
      },
    });

    if (!response.ok) {
      return res.status(response.status).send('Error fetching the resource');
    }

    // Stream the media segment back to the client
    const contentType = response.headers.get('content-type');
    res.setHeader('Content-Type', contentType);

    const body = await response.arrayBuffer();
    res.status(200).send(Buffer.from(body));
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
