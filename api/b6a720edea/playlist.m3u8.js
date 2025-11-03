export default async function handler(req, res) {
  const targetUrl = "https://bostaflix.vercel.app/video.mp4";

  try {
    // Pass through Range headers for seeking support
    const range = req.headers.range ? { Range: req.headers.range } : {};

    const response = await fetch(targetUrl, {
      headers: range,
    });

    // Copy status and headers from origin
    res.status(response.status);

    // Forward essential headers
    for (const [key, value] of response.headers.entries()) {
      if (["content-type", "content-length", "accept-ranges", "content-range"].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    }

    // Add CORS headers for Clappr
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Range, Content-Type");

    // Handle OPTIONS preflight
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    // Stream data to the client
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));

  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Error fetching video");
  }
}
