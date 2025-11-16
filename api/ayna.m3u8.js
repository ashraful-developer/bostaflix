// api/proxy.js
export default async function handler(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      res.status(400).json({ error: "Missing 'id' query parameter" });
      return;
    }

    // Construct the API URL that gives the m3u8 JSON
    const apiUrl = `https://bongoflixbd.top/apis/live.php?id=${encodeURIComponent(id)}`;

    // Fetch the JSON from the API
    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
        "Accept": "application/json",
        "Referer": "https://bongoflixbd.top/"
      }
    });

    const data = await response.json();

    if (!data.url) {
      res.status(404).json({ error: "No stream URL found" });
      return;
    }

    // Redirect the client to the actual m3u8 URL
    res.writeHead(302, { Location: data.url });
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
