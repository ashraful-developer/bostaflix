export default async function handler(req, res) {
  const { masterUrl } = req.query;

  if (!masterUrl) {
    return res.status(400).send("Missing 'masterUrl' query parameter.");
  }

  try {
    // Fetch the master M3U8 file
    const masterResponse = await fetch(masterUrl);
    if (!masterResponse.ok) {
      return res.status(masterResponse.status).send("Failed to fetch master playlist.");
    }
    const masterPlaylist = await masterResponse.text();

    // Extract the base URL of the master M3U8 file
    const baseUrl = new URL(masterUrl).origin + new URL(masterUrl).pathname.replace(/\/[^/]*$/, "/");

    // Find the chunks.m3u8 URL (resolve relative URL if needed)
    const chunkRegex = /#EXT-X-STREAM-INF:[^\n]+\n([^\n]+)/g;
    const match = chunkRegex.exec(masterPlaylist);
    if (!match) {
      return res.status(404).send("No 'chunks.m3u8' found in the master playlist.");
    }
    const chunksPath = match[1].trim();
    const chunksUrl = new URL(chunksPath, baseUrl).href;

    // Fetch the chunks.m3u8 file
    const chunkResponse = await fetch(chunksUrl);
    if (!chunkResponse.ok) {
      return res.status(chunkResponse.status).send("Failed to fetch chunks playlist.");
    }
    const chunkPlaylist = await chunkResponse.text();

    // Proxy the chunks.m3u8 content
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.status(200).send(chunkPlaylist);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An internal server error occurred.");
  }
}
