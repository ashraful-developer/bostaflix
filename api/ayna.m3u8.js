export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).send("Missing id");
  }

  try {
    // Fetch the JSON list of streams
    const jsonRes = await fetch("https://stream-cdn-bostaflix.global.ssl.fastly.net/ayna/api.json");
    if (!jsonRes.ok) throw new Error("Failed to fetch API JSON");
    const jsonData = await jsonRes.json();

    // Find item by ID
    const item = jsonData.find(entry => entry.id === id);
    if (!item) return res.status(404).send("ID not found");

    // Fetch HTML page
    const htmlRes = await fetch(`https://re.fredflix.fun/ayna/play.php?id=${id}`);
    if (!htmlRes.ok) throw new Error("Failed to fetch play page");
    const html = await htmlRes.text();

    // Match m3u8 URL (with token and other params)
    const m3u8Match = html.match(/https:\/\/[^"'<>]+\.m3u8[^"'<>]*/);
    if (!m3u8Match) return res.status(500).send("M3U8 URL not found");

    const m3u8Url = m3u8Match[0];

    // Redirect to M3U8
    return res.redirect(302, m3u8Url);
  } catch (err) {
    console.error("Error:", err.message);
    return res.status(500).send("Internal server error");
  }
}
