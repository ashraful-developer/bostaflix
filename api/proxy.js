export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) {
    res.status(400).send("Missing URL");
    return;
  }

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const decodedUrl = decodeURIComponent(url);

    const response = await fetch(decodedUrl, {
      headers: {
        "Referer": "https://archive.org/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    if (!response.ok) {
      throw new Error(`Fetch failed with status ${response.status}`);
    }

    const content = await response.text();

    res.setHeader("Content-Type", "text/plain");
    res.status(200).send(content);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Proxy error occurred.");
  }
}
