export default async function handler(req, res) {
  try {
    const { title } = req.query;
    if (!title) {
      res.statusCode = 400;
      return res.end("Missing ?title parameter");
    }

    // Step 1: Fetch Ayna homepage HTML
    const resp = await fetch("https://aynaxbosta.global.ssl.fastly.net/Ayna/");
    const html = await resp.text();

    // Step 2: Match the correct channel <a href="play.php?id=..."><h6>Title</h6></a>
    const safeTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // escape regex special chars
    const regex = new RegExp(
      `<a[^>]+href=["']play\\.php\\?id=([^"']+)["'][^>]*>\\s*<[^>]*>\\s*<h6[^>]*>\\s*${safeTitle}\\s*<\\/h6>`,
      "i"
    );
    const match = html.match(regex);

    if (!match) {
      res.statusCode = 404;
      return res.end(`Channel not found for title: ${title}`);
    }

    const id = match[1];

    // Step 3: Fetch play.php?id=... to extract real stream URL
    const playResp = await fetch(`https://aynaxbosta.global.ssl.fastly.net/Ayna/play.php?id=${encodeURIComponent(id)}`);
    const playHtml = await playResp.text();

    // Step 4: Find "streamUrl" inside JS (different sites sometimes wrap it differently)
    const urlRegex = /streamUrl\s*:\s*["'](https:\/\/[^"']+\.m3u8)["']/i;
    const urlMatch = playHtml.match(urlRegex);

    if (!urlMatch) {
      res.statusCode = 404;
      return res.end("streamUrl not found in play.php page");
    }

    const streamUrl = urlMatch[1];

    // Step 5: Redirect (302) to final .m3u8 stream
    res.writeHead(302, { Location: streamUrl });
    res.end();
  } catch (err) {
    res.statusCode = 500;
    res.end("Server error: " + err.message);
  }
}
