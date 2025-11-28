export default async function handler(req, res) {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).send("Missing ?url parameter");
    }

    const response = await fetch(url); // No headers
    const html = await response.text();

    // Return raw HTML so your client JS can parse and run aes.js on it
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);

  } catch (e) {
    console.error(e);
    res.status(500).send("Proxy error");
  }
}
