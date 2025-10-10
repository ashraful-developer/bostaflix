export default async function handler(req, res) {
  try {
    // Get ?id= param
    const { id } = req.query;
    if (!id) {
      res.statusCode = 400;
      return res.end("Missing ?id parameter");
    }

    // Fetch the HTML from Fastly CDN
    const resp = await fetch(`https://aynaxbosta.global.ssl.fastly.net/Ayna/play.php?id=${encodeURIComponent(id)}`);
    const html = await resp.text();

    // Extract streamUrl using regex
    const match = html.match(/streamUrl:\s*"(https:\/\/[^"]+)"/);
    if (!match) {
      res.statusCode = 404;
      return res.end("streamUrl not found");
    }

    const streamUrl = match[1];

    // Redirect (302)
    res.statusCode = 302;
    res.setHeader("Location", streamUrl);
    res.end();
  } catch (err) {
    res.statusCode = 500;
    res.end("Server error: " + err.message);
  }
}
