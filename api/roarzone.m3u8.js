export default async function handler(req, res) {
  const ALLOWED_ORIGIN = "https://bostaflix.vercel.app";

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

    const origin = req.headers.origin || "";
    const referer = req.headers.referer || "";

    // 🧠 Detect source
    const isFromBostaflix =
      origin.includes(ALLOWED_ORIGIN) ||
      referer.startsWith(ALLOWED_ORIGIN);

    const isDirectBrowser = !origin && !referer;

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

    const directUrl = match[0];

    // 🔥 Decide routing
    let finalUrl;

    if (isFromBostaflix || isDirectBrowser) {
      finalUrl = `https://bosta-live.vercel.app/api/live?url=${encodeURIComponent(directUrl)}`;
    } else {
      finalUrl = directUrl;
    }

    res.writeHead(302, {
      Location: finalUrl,
      "Cache-Control": "no-store"
    });

    res.end();

  } catch (err) {
    res.status(500).send("Upstream error");
  }
}
