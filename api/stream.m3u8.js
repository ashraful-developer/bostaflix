export default async function handler(req, res) {
  const urlMap = {
    1: "https://cdn.hoichoi24.com/carton-duronto/tracks-v1a1/mono.m3u8",
    2: "https://cdn.hoichoi24.com/gtv-sports-tv5.hoichoi24.com/tracks-v1a1/mono.m3u8",
    3: "https://cdn.hoichoi24.com/t-sports-tv5.hoichoi24.com/tracks-v1a1/mono.m3u8",
    4: "https://allinonereborn.com/test.m3u8/ts.php?ts=http://stvlive.net:8080/tsports2/tracks-v1a1/mono.m3u8",
  };

  const baseUrls = {
    1: "https://cdn.hoichoi24.com/carton-duronto/tracks-v1a1/",
    2: "https://cdn.hoichoi24.com/gtv-sports-tv5.hoichoi24.com/tracks-v1a1/",
    3: "https://cdn.hoichoi24.com/t-sports-tv5.hoichoi24.com/tracks-v1a1/",
    4: "http://stvlive.net:8080/tsports2/tracks-v1a1/",
  };

  const { id } = req.query;

  if (!urlMap[id]) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const httpUrl = urlMap[id];
  const specificBaseUrl = baseUrls[id];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

  try {
    const response = await fetch(httpUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(response.status).json({ error: `Failed to fetch resource: ${response.statusText}` });
    }

    const text = await response.text();

    let updatedText;
    try {
      updatedText = text.replace(/^(?!#)(.+)$/gm, (line) => {
        try {
          return new URL(line, specificBaseUrl).toString();
        } catch {
          return line;
        }
      });
    } catch (parseError) {
      return res.status(500).json({ error: "Error processing file", details: parseError.message });
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");

    res.status(200).send(updatedText);
  } catch (error) {
    if (error.name === "AbortError") {
      return res.status(504).json({ error: "Fetch request timed out (5s limit)" });
    }
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}
