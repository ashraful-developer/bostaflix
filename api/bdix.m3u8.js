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

    const pageUrl = `http://103.144.89.251/player.php?stream=${encodeURIComponent(stream)}`;

    const response = await fetch(pageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html",
      },
      redirect: "follow"
    });

    const html = await response.text();

    const match = html.match(/https?:\/\/[^"' ]+\.m3u8[^"' ]*/i);

    if (!match) {
      res.status(404).send("Stream not found");
      return;
    }

    // Replace host
    const originalUrl = match[0];
    const modifiedUrl = originalUrl.replace(
      "http://103.144.89.251:8082",
      "http://livecdn-bostaflix.global.ssl.fastly.net"
    );

    res.writeHead(302, {
      Location: modifiedUrl,
      "Cache-Control": "no-store"
    });
    res.end();

  } catch (err) {
    res.status(500).send("Upstream error");
  }
}
