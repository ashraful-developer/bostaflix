export default async function handler(req, res) {
  try {
    const { title, type } = req.query;

    if (!title) {
      res.status(400).end("Missing ?title parameter");
      return;
    }

    // Fetch Ayna homepage
    const resp = await fetch("https://aynaxbosta.global.ssl.fastly.net/Ayna/");
    const html = await resp.text();

    // Escape regex special characters in title for safe matching
    const safeTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Find all channel cards
    const cardRegex = /<div class="channel-card[\s\S]*?<\/div>\s*<\/div>/gi;
    const cards = html.match(cardRegex);
    if (!cards) {
      res.status(500).end("No channel cards found");
      return;
    }

    let foundId = null;

    // Search for the matching title
    for (const card of cards) {
      const titleRegex = new RegExp(
        `<h6[^>]*class=["']channel-name["'][^>]*>\\s*${safeTitle}\\s*<\\/h6>`,
        "i"
      );
      if (titleRegex.test(card)) {
        const idMatch = card.match(/href=["']play\.php\?id=([^"']+)["']/i);
        if (idMatch) {
          foundId = idMatch[1];
          break;
        }
      }
    }

    if (!foundId) {
      res.status(404).json({ status: "error", message: `Channel not found for title: ${title}` });
      return;
    }

    // ✅ If ?type=json → return JSON instead of redirect
    if (type && type.toLowerCase() === "json") {
      res.status(200).json({
        status: "success",
        title,
        id: foundId,
        redirect: `/api/ayna-proxy.m3u8?id=${encodeURIComponent(foundId)}`
      });
      return;
    }

    // ✅ Default: redirect to the proxy .m3u8 endpoint
    res.writeHead(302, {
      Location: `/api/ayna-proxy.m3u8?id=${encodeURIComponent(foundId)}`,
    });
    res.end();

  } catch (err) {
    res.status(500).end("Server error: " + err.message);
  }
}
