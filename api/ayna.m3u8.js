// /api/m3u8.js
export default async function handler(req, res) {
  try {
    const { id } = req.query;
    if (!id) {
      res.status(400).json({ error: "Missing 'id' query parameter" });
      return;
    }

    // -----------------------
    // 1) Get token cookie robustly
    // -----------------------
    // Try req.cookies (if you have cookie parsing middleware)
    let userCookie = (req.cookies && req.cookies.mytoken) || "";

    // Fallback: parse from header if not present
    if (!userCookie && req.headers && req.headers.cookie) {
      const parsed = Object.fromEntries(
        req.headers.cookie.split(";").map(s => {
          const [k, ...v] = s.trim().split("=");
          return [k, decodeURIComponent((v || []).join("="))];
        })
      );
      userCookie = parsed.mytoken || "";
    }

    // Log what we found
    console.log(`[m3u8] id=${id} - mytoken cookie (length):`, userCookie ? userCookie.length : 0);

    if (!userCookie) {
      console.warn("[m3u8] Missing AES token cookie 'mytoken' — request will likely fail");
      // Optionally return error — here we continue to attempt request but still log
      // return res.status(400).json({ error: "Missing AES token cookie 'mytoken'" });
    }

    // -----------------------
    // 2) Build play URL + headers (inject dynamic cookie)
    // -----------------------
    const playUrl = `https://xfireflix.ct.ws/ayna/play.php?id=${encodeURIComponent(id)}`;

    const headers = {
      "cache-control": "no-cache, max-age=0",
      "connection": "keep-alive",
      "content-type": "text/html; charset=UTF-8",
      "accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-encoding": "gzip, deflate, br",
      "accept-language": "en-US,en;q=0.9,bn;q=0.8",
      // forward dynamic cookie (if present) — adapt cookie name if server expects different key
      "cookie": userCookie ? `__test=${userCookie}` : "__test=;",
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

    // -----------------------
    // 3) Fetch remote page
    // -----------------------
    const response = await fetch(playUrl, { headers });
    const html = await response.text();

    // Log first 100 chars of response (safe for debugging)
    const first100 = html.slice(0, 100).replace(/\s+/g, " ");
    console.log(`[m3u8] Fetched play page (first 100 chars): ${first100}`);

    // -----------------------
    // 4) Extract m3u8 URL
    // -----------------------
    const match = html.match(/(https?:\/\/[^'"]+\.m3u8[^'"]*)/);
    if (!match) {
      console.error("[m3u8] No m3u8 URL found in fetched HTML.");
      return res.status(404).json({ error: "No m3u8 URL found" });
    }

    let m3u8Url = match[1];
    m3u8Url = m3u8Url.replace(/\\\//g, "/").replace(/([^:]\/)\/+/g, "$1");

    console.log(`[m3u8] Redirecting to m3u8: ${m3u8Url}`);

    // -----------------------
    // 5) Redirect to m3u8
    // -----------------------
    res.writeHead(302, { Location: m3u8Url });
    res.end();
  } catch (err) {
    console.error("[m3u8] Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
