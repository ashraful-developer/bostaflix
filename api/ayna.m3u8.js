// api/proxy.js
export default async function handler(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      res.status(400).json({ error: "Missing 'id' query parameter" });
      return;
    }

    // Target URL
    const targetUrl = `https://bongoflixbd.top/apis/live.php?id=${encodeURIComponent(id)}`;

    // Simulate request from a PC (desktop browser)
    const desktopUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36";

    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": desktopUA,
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
      }
    });

    // Forward content type
    const contentType = response.headers.get("content-type") || "text/plain";
    res.setHeader("Content-Type", contentType);

    const body = await response.text();
    res.status(response.status).send(body);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
