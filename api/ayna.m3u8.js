export default async function handler(req, res) {
  try {
    const { title } = req.query;
    if (!title) {
      res.statusCode = 400;
      return res.end("Missing ?title parameter");
    }

    // Step 1: Fetch Ayna homepage
    const homeResp = await fetch("https://aynaxbosta.global.ssl.fastly.net/Ayna/");
    const html = await homeResp.text();

    // Step 2: Extract ID by matching channel title
    const safeTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(
      `<a[^>]+href=["']play\\.php\\?id=([^"']+)["'][^>]*>[\\s\\S]*?<h6[^>]*>${safeTitle}<\\/h6>`,
      "i"
    );
    const match = html.match(regex);
    if (!match) {
      res.statusCode = 404;
      return res.end(`Channel not found for title: ${title}`);
    }

    const id = match[1];

    // Step 3: Fetch the play page to get stream URL
    const playResp = await fetch(`https://aynaxbosta.global.ssl.fastly.net/Ayna/play.php?id=${encodeURIComponent(id)}`);
    const playHtml = await playResp.text();

    // Step 4: Extract the final stream URL (from 'streamUrl: "<URL>"')
    const streamMatch = playHtml.match(/streamUrl:\s*"(https:\/\/[^"]+)"/);
    if (!streamMatch) {
      res.statusCode = 404;
      return res.end("streamUrl not found");
    }

    const streamUrl = streamMatch[1];

    // Step 5: Redirect directly to final stream
    res.writeHead(302, { Location: streamUrl });
    res.end();
  } catch (err) {
    res.statusCode = 500;
    res.end("Server error: " + err.message);
  }
}
