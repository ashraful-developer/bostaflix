export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).send("Missing video ID");
  }

  const webpageUrl = `https://inv.nadeko.net/watch?v=${id}`;

  try {
    // Fetch the webpage to get the m3u8 URL
    const response = await fetch(webpageUrl, {
      headers: {
  "authority": "inv.nadeko.net",
  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "accept-encoding": "gzip, deflate, br, zstd",
  "accept-language": "en-US,en;q=0.9,bn;q=0.8",
  "cache-control": "max-age=0",
  "cookie": "PREFS=%7B%22volume%22%3A100%2C%22speed%22%3A1%7D; INVIDIOUS_SERVER_ID=2",
  "dnt": "1",
  "priority": "u=0, i",
  "referer": "https://inv.nadeko.net/",
  "sec-fetch-dest": "document",
  "sec-fetch-mode": "navigate",
  "sec-fetch-site": "same-origin",
  "sec-fetch-user": "?1",
  "upgrade-insecure-requests": "1",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to load page. Status: ${response.status}`);
    }

    const html = await response.text();

    // Extract the m3u8 stream URL from the HTML
    const match = html.match(/<source\s+src="([^"]+)"\s+type="application\/x-mpegURL"/);
    
    if (!match || !match[1]) {
      return res.status(404).send("Stream link not found");
    }

    let streamUrl = match[1];

    // Convert relative URL to absolute
    if (!streamUrl.startsWith("http")) {
      const baseUrl = new URL(webpageUrl).origin;
      streamUrl = baseUrl + streamUrl;
    }

    // Append ?local=true to the stream URL
    const redirectUrl = streamUrl.includes("?") ? `${streamUrl}&local=true` : `${streamUrl}?local=true`;

    console.log("Redirecting to:", redirectUrl);

    // Redirect user to the actual stream URL
    res.writeHead(302, { Location: redirectUrl });
    res.end();
  } catch (error) {
    console.error("Error fetching stream:", error);
    res.status(500).send("Error fetching stream");
  }
}
