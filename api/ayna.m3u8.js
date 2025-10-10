export default async function handler(req, res) {
  try {
    const { title } = req.query;
    if (!title) {
      res.status(400).end("Missing ?title parameter");
      return;
    }

    // Fetch Ayna page
    const resp = await fetch("https://aynaxbosta.global.ssl.fastly.net/Ayna/");
    const html = await resp.text();

    // Escape regex special characters in title
    const safeTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Match individual channel cards
    const cardRegex = /<div class="channel-card[\s\S]*?<\/div>\s*<\/div>/gi;
    const cards = html.match(cardRegex);

    if (!cards) {
      res.status(500).end("No channel cards found");
      return;
    }

    let foundId = null;

    for (const card of cards) {
      // Look for the title inside this card
      const titleRegex = new RegExp(
        `<h6[^>]*class=["']channel-name["'][^>]*>\\s*${safeTitle}\\s*<\\/h6>`,
        "i"
      );
      if (titleRegex.test(card)) {
        // Extract its ID
        const idMatch = card.match(/href=["']play\.php\?id=([^"']+)["']/i);
        if (idMatch) {
          foundId = idMatch[1];
          break;
        }
      }
    }

    if (!foundId) {
      res.status(404).end(`Channel not found for title: ${title}`);
      return;
    }

    // Redirect to your proxy endpoint
    res.writeHead(302, {
      Location: `/api/ayna-proxy.m3u8?id=${encodeURIComponent(foundId)}`,
    });
    res.end();

  } catch (err) {
    res.status(500).end("Server error: " + err.message);
  }
}
