export default async function handler(req, res) {
  try {
    const { title } = req.query;
    if (!title) {
      res.statusCode = 400;
      return res.end("Missing ?title parameter");
    }

    // Fetch the Ayna homepage (or the HTML where the grid is)
    const resp = await fetch("https://aynaxbosta.global.ssl.fastly.net/Ayna/");
    const html = await resp.text();

    // Make case-insensitive regex for the title (HTML may differ in capitalization)
    const safeTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(
      `<a[^>]+href=["']play\\.php\\?id=([^"']+)["'][^>]*>[\\s\\S]*?<h6[^>]*>${safeTitle}<\/h6>`,
      "i"
    );

    const match = html.match(regex);
    if (!match) {
      res.statusCode = 404;
      return res.end(`Channel not found for title: ${title}`);
    }

    const id = match[1];

    // Optional: you can redirect to the play API from before
    // Example: redirect to /api/ayna-proxy?id=<found-id>
    res.statusCode = 302;
    res.setHeader("Location", `/api/ayna-proxy?id=${encodeURIComponent(id)}`);
    res.end();
  } catch (err) {
    res.statusCode = 500;
    res.end("Server error: " + err.message);
  }
}
