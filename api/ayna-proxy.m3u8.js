// File: api/aynaott.js

export default async function handler(req, res) {
  try {
    const { id, url } = req.query || {};
    if (!id && !url) {
      return sendError(res, 400, "Provide ?id=... or ?url=...");
    }

    // Build target URL
    const target = id
      ? `https://yflix.top/aynaott/player.php?id=${encodeURIComponent(id)}`
      : url;

    const upstream = await fetch(target, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AynaOTT-LinkFetcher/1.0)" },
    });

    if (!upstream.ok) {
      return sendError(res, upstream.status, `Upstream responded ${upstream.status}.`);
    }

    const html = await upstream.text();

    // Find first occurrence of a tvsen6.aynaott.com URL
    const match = html.match(/https:\/\/tvsen6\.aynaott\.com\/[^\s"'<>]+/i);
    if (!match) {
      return sendError(res, 404, "No aynaott.com URL found in page.");
    }

    // Replace host
    const fileUrl = match[0].replace(
      "https://tvsen6.aynaott.com/",
      "https://tvsen6.aynascope.net/"
    );

    // Redirect (302)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.writeHead(302, { Location: fileUrl });
    return res.end();
  } catch (err) {
    return sendError(res, 500, err?.message || "Unexpected error.");
  }
}

function sendError(res, code, message) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(code).json({ ok: false, error: message });
}
