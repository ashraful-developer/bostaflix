// api/proxy.js
export default async function handler(req, res) {
  try {
    const { id } = req.query;
    if (!id) {
      res.status(400).json({ error: "Missing 'id' query parameter" });
      return;
    }

    const playUrl = `https://bdixtv24.com/Ayna/play.php?id=${encodeURIComponent(id)}`;

    const response = await fetch(playUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
        "Accept": "text/html",
        "Referer": "https://bdixtv24.com/Ayna/play.php?id=${encodeURIComponent(id)}",
      },
    });

    const html = await response.text();

    const match = html.match(/const\s+streamUrl\s*=\s*"([^"]+)"/);
    if (!match) {
      res.status(404).json({ error: "No stream URL found" });
      return;
    }

    let streamUrl = match[1];

    // STEP 1 → Fix escaped slashes (\/)
    streamUrl = streamUrl.replace(/\\\//g, "/");

    // STEP 2 → Collapse double slashes but keep https:// intact
    streamUrl = streamUrl.replace(/([^:]\/)\/+/g, "$1");

    // Optional: Log to verify
    console.log("CLEAN URL:", streamUrl);

    res.writeHead(302, { Location: streamUrl });
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
