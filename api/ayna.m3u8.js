export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    res.status(400).send("Missing 'id' query parameter.");
    return;
  }

  try {
    const response = await fetch('https://stream-cdn-bostaflix.global.ssl.fastly.net/ayna/');
    const html = await response.text();

    const regex = new RegExp(
      `<div class="card[^>]*?" onclick="openPlayer\\('([a-f0-9\\-]+)'\\)">\\s*<img[^>]*?/>\\s*<div class="card-body[^>]*?>\\s*<small><b>${id}</b></small>`,
      'i'
    );

    const match = html.match(regex);

    if (!match || !match[1]) {
      res.status(404).send(`Channel '${id}' not found.`);
      return;
    }

    const playerId = match[1];
    const redirectUrl = `https://stream-cdn-bostaflix.global.ssl.fastly.net/ayna/playlist.php?id=${playerId}&e=.m3u8s`;

    res.writeHead(302, { Location: redirectUrl });
    res.end();
  } catch (err) {
    res.status(500).send("Server Error: " + err.message);
  }
}
