// /api/m3u8.js
export default async function handler(req, res) {
  try {
    const { id } = req.query;
    if (!id) {
      res.status(400).json({ error: "Missing 'id' query parameter" });
      return;
    }

    // ✅ 1. Read dynamic AES-decrypted cookie from browser
    //    (Sent automatically because Clappr uses xhr.withCredentials)
    const userCookie = req.cookies?.mytoken || "";  

    // If no cookie → show error (token must exist)
    if (!userCookie) {
      return res.status(400).json({ error: "Missing AES token cookie 'mytoken'" });
    }

    // Xfireflix play page
    const playUrl = `https://xfireflix.ct.ws/ayna/play.php?id=${encodeURIComponent(id)}`;

    // ---------------------------------------
    // 2. Build headers (dynamic cookie added)
    // ---------------------------------------
    const headers = {
      "cache-control": "no-cache, max-age=0",
      "connection": "keep-alive",
      "content-type": "text/html; charset=UTF-8",
      "accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-encoding": "gzip, deflate, br",
      "accept-language": "en-US,en;q=0.9,bn;q=0.8",

      // 🔥 The dynamic AES cookie (critical)
      "cookie": `__test=${userCookie}`,

      "dnt": "1",
      "pragma": "no-cache",
      "referer": playUrl,
      "sec-ch-ua":
        '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": '"Android"',
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "upgrade-insecure-requests": "1",
      "user-agent":
        "Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36"
    };

    // ---------------------------------------
    // 3. Fetch remote page
    // ---------------------------------------
    const response = await fetch(playUrl, { headers });
    const html = await response.text();

    // ---------------------------------------
    // 4. Extract .m3u8 URL
    // ---------------------------------------
    const match = html.match(/(https?:\/\/[^'"]+\.m3u8[^'"]*)/);
    if (!match) {
      return res.status(404).json({ error: "No m3u8 URL found" });
    }

    let m3u8Url = match[1];

    // Fix double slashes
    m3u8Url = m3u8Url.replace(/\\\//g, "/").replace(/([^:]\/)\/+/g, "$1");

    // ---------------------------------------
    // 5. Redirect client to actual m3u8
    // ---------------------------------------
    res.writeHead(302, { Location: m3u8Url });
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
