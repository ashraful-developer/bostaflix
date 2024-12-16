export default async function handler(req, res) {
  // Base URL for the proxied source
  const baseUrl = "https://mafiatv.live/ayna";
  const httpUrl = `${baseUrl}/stream.m3u8?id=37&e=.m3u8`;

  try {
    // Fetch the M3U8 playlist
    const response = await fetch(httpUrl, {
      method: 'GET',
      headers: {
        'Referer': 'https://mafiatv.live/ayna/?watch=37',
        'User-Agent': 'Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.188 Safari/537.36 CrKey/1.54.250320',
      },
    });

    if (!response.ok) {
      return res.status(response.status).send('Error fetching the resource');
    }

    const playlist = await response.text();

    // Rewrite URLs to route through the proxy
    const proxiedPlaylist = playlist.replace(
      /^(?!#)([^#\s]+)/gm, // Matches lines that are not comments and not empty
      `${req.headers.host}/api/proxy?url=${encodeURIComponent(baseUrl)}/$1`
    );

    // Set CORS headers to allow cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Set the appropriate content-type header for M3U8 playlists
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');

    // Send the modified playlist back to the client
    res.status(200).send(proxiedPlaylist);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
