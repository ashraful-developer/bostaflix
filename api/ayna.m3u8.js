export default async function handler(req, res) {
  try {
    const { title } = req.query;
    if (!title) {
      res.statusCode = 400;
      return res.end("Missing ?title parameter");
    }

    // Fetch Ayna page
    const resp = await fetch("https://aynaxbosta.global.ssl.fastly.net/Ayna/");
    const html = await resp.text();

    // Escape regex special characters in title
    const safeTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Match the entire card block that contains the title (case-insensitive)
    const regex = new RegExp(
      `<a[^>]+href=["']play\\.php\\?id=([^"']+)["'][^>]*>[\\s\\S]*?<h6[^>]*class=["']channel-name["'][^>]*>\\s*${safeTitle}\\s*<\\/h6>`,
      "i"
    );

    const match = html.match(regex);
    if (!match) {
      res.statusCode = 404;
      return res.end(`Channel not found for title: ${title}`);
    }

    const id = match[1];

    // Redirect to your proxy with the found ID
    res.writeHead(302, {
      Location: `/api/ayna-proxy.m3u8?id=${encodeURIComponent(id)}`,
    });
    res.end();

  } catch (err) {
    res.statusCode = 500;
    res.end("Server error: " + err.message);
  }
}
