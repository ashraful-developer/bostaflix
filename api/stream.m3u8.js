
export default async function handler(req, res) {
  // Define a mapping of IDs to URLs
  const urlMap = {
    1: "https://cdn.hoichoi24.com/carton-duronto/tracks-v1a1/mono.m3u8",
    2: "https://cdn.hoichoi24.com/gtv-sports-tv5.hoichoi24.com/tracks-v1a1/mono.m3u8",
    3: "https://cdn.hoichoi24.com/t-sports-tv5.hoichoi24.com/tracks-v1a1/mono.m3u8",
    4: "http://stvlive.net:8080/tsports2/tracks-v1a1/mono.m3u8",
  };

  // Define corresponding base URLs
  const baseUrls = {
    1: "https://cdn.hoichoi24.com/carton-duronto/tracks-v1a1/",
    2: "https://cdn.hoichoi24.com/gtv-sports-tv5.hoichoi24.com/tracks-v1a1/",
    3: "https://cdn.hoichoi24.com/t-sports-tv5.hoichoi24.com/tracks-v1a1/",
    4: "https://allinonereborn.com/test.m3u8/ts.php?ts=http://stvlive.net:8080/tsports2/tracks-v1a1/",
  };
  // Get the ID from query parameters
  const { id } = req.query;
  
  // Convert ID to a number (to ensure correct key lookup)
  const numericId = Number(id);
  
  // Validate ID
  if (!urlMap[numericId]) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const httpUrl = urlMap[numericId];
  const specificBaseUrl = baseUrls[numericId];

  try {
    // Fetch the M3U8 file with a timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout
    
    const response = await fetch(httpUrl, { signal: controller.signal });
    clearTimeout(timeout);
    
    if (!response.ok) {
      return res.status(response.status).send("Error fetching the resource");
    }

    const text = await response.text();

    // Update relative URLs in the M3U8 file
    const updatedText = text.replace(/^(?!#)(?!https?:\/\/)(.+)$/gm, (line) => {
      return specificBaseUrl + line;
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
