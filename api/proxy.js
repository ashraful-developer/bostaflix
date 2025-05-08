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
    res.status(200).end(); // Respond to preflight
    return;
  }

  try {
    const response = await fetch(decodeURIComponent(url));
    if (!response.ok) {
      res.status(response.status).send("Fetch failed");
      return;
    }

    const text = await response.text();
    res.setHeader("Content-Type", "text/plain");
    res.status(200).send(text);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Server error");
  }
}
