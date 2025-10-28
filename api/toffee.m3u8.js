export default async function handler(req, res) {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Missing 'id' query parameter" });
    }

    // Step 1: Fetch HTML from player.php
    const playerUrl = `https://aynaxbosta.global.ssl.fastly.net/test/player.php?play=${encodeURIComponent(play)}`;
    const html = await fetch(playerUrl).then(r => r.text());

    // Step 2: Find live.php link in HTML
    const match = html.match(/live\.php\?id=[^"'&<> ]+[^"'<>]*/i);
    if (!match) {
      return res.status(404).json({ error: "No live.php link found" });
    }

    const livePath = match[0];
    const redirectUrl = `https://aynaxbosta.global.ssl.fastly.net/test/${livePath}`;

    // Step 3: Redirect
    res.writeHead(302, { Location: redirectUrl });
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}
