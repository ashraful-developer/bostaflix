export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const { stream } = req.query;

    if (!stream) {
      res.status(400).send("Missing stream id");
      return;
    }

    const pageUrl = `https://tv.roarzone.info/player.php?stream=${encodeURIComponent(stream)}`;

    const response = await fetch(pageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html",
        "Referer": "https://tv.roarzone.info/",
        "Origin": "https://tv.roarzone.info"
      },
      redirect: "follow"
    });

    const html = await response.text();

    const match = html.match(/https?:\/\/[^"' ]+\.m3u8[^"' ]*/i);

    if (!match) {
      res.status(404).send("Stream not found");
      return;
    }

    res.writeHead(302, {
      Location: match[0],
      "Cache-Control": "no-store"
    });
    res.end();

  } catch (err) {
    res.status(500).send("Upstream error");
  }
}

