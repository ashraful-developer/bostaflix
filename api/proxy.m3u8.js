export default async function handler(req, res) {
  const { id, server } = req.query; // Changed 'string' to 'server'
  if (!id || !server) {
    return res.status(400).send("Missing parameters");
  }

  // Define hardcoded M3U8 links
  const playlists = {
    "1": "https://bostaflix.vercel.app/api/stream.m3u8?id=4",
    "2": "https://example.com/playlist2.m3u8",
  };

  const m3u8Url = playlists[id];
  if (!m3u8Url) {
    return res.status(404).send("Playlist not found");
  }

  try {
    const response = await fetch(m3u8Url);
    if (!response.ok) {
      return res.status(500).send("Failed to fetch playlist");
    }
    let content = await response.text();

    // Modify the M3U8 file by appending the server URL to each segment
    content = content.replace(/^(?!#)(.*\.ts)/gm, `https://allinonereborn.com/test.m3u8/ts.php?url=$1`);

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.send(content);
  } catch (error) {
    res.status(500).send("Error processing playlist");
  }
}
