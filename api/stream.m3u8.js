export default async function handler(req, res) {
  // Define a mapping of IDs to URLs
  const urlMap = {
    duronto: "https://cdn.hoichoi24.com/carton-duronto/tracks-v1a1/mono.m3u8",
    gtv: "https://cdn.hoichoi24.com/gtv-sports-tv5.hoichoi24.com/tracks-v1a1/mono.m3u8",
    tsports: "https://cdn.hoichoi24.com/t-sports-tv5.hoichoi24.com/tracks-v1a1/mono.m3u8",
    tsports-2: "https://www.its-ferdos-alom.top/rajpondit/ts/live.php?id=ebaf111833af&e=.m3u8",
  };

  // Define corresponding base URLs
  const baseUrls = {
    duronto: "https://cdn.hoichoi24.com/carton-duronto/tracks-v1a1/",
    gtv: "https://cdn.hoichoi24.com/gtv-sports-tv5.hoichoi24.com/tracks-v1a1/",
    tsports: "https://cdn.hoichoi24.com/t-sports-tv5.hoichoi24.com/tracks-v1a1/",
    tsports-2: "https://www.its-ferdos-alom.top/rajpondit/ts/",
  };

  // Get the ID from query parameters
  const { id } = req.query;
  
  // Validate ID
  if (!urlMap[id]) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const httpUrl = urlMap[id];
  const specificBaseUrl = baseUrls[id];

  try {
    // Fetch the M3U8 file
    const response = await fetch(httpUrl);
    if (!response.ok) {
      return res.status(response.status).send("Error fetching the resource");
    }

    const text = await response.text();

    // Update relative URLs in the M3U8 file
    const updatedText = text.replace(/^(?!#)(.+)$/gm, (line) => {
      try {
        const url = new URL(line, specificBaseUrl);
        return url.toString();
      } catch {
        return line;
      }
    });

    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");

    // Send response
    res.status(200).send(updatedText);
  } catch (error) {
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}
