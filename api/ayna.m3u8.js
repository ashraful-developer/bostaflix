// api/proxy.js
export default async function handler(req, res) {
  try {
    const { id } = req.query;
    if (!id) {
      res.status(400).json({ error: "Missing 'id' query parameter" });
      return;
    }

    // The source page that includes the embedded m3u8
    const playUrl = `https://bdixtv24.com/Ayna/play.php?id=${encodeURIComponent(id)}`;

    // Fetch the HTML from that page
    const response = await fetch(playUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
        "Accept": "text/html",
        "Referer": "https://xfireflix.fun/",
      },
    });

    const html = await response.text();

    // Extract the streamUrl from inside the script tag
    const match = html.match(/streamUrl\s*:\s*"([^"]+)"/);
    if (!match) {
      res.status(404).json({ error: "No stream URL found" });
      return;
    }

    const streamUrl = match[1];

    // Option 1: redirect straight to m3u8
    res.writeHead(302, { Location: streamUrl });
    res.end();

    // Option 2 (if you prefer JSON response):
    // res.status(200).json({ url: streamUrl });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
