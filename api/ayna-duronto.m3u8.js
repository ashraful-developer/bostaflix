export default async function handler(req, res) {
  // Fixed URL to proxy from
  const baseUrl = "https://mafiatv.live/ayna"; // Base URL for relative paths in the playlist
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

    // Check if the response is successful
    if (!response.ok) {
      return res.status(response.status).send('Error fetching the resource');
    }

    // Get the playlist content as text
    const playlist = await response.text();

    // Rewrite relative URLs to absolute URLs
    const updatedPlaylist = playlist.replace(
      /^(?!#)([^#\s]+)/gm, // Matches lines that are not comments and not empty
      `${baseUrl}/$1` // Prefixes each relative path with the base URL
    );

    // Set CORS headers to allow cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Set the appropriate content-type header for M3U8 playlists
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');

    // Send the modified playlist back to the client
    res.status(200).send(updatedPlaylist);
  } catch (error) {
    // Handle any errors during the fetch or processing
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
