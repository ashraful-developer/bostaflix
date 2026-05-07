// /api/m3u8.js

export default async function handler(req, res) {
  try {
    const { id } = req.query;

    // --- 1) Read dynamic cookie (__test) ---
    let userCookie = (req.cookies && req.cookies.__test) || "";

    if (!userCookie && req.headers.cookie) {
      const parsed = Object.fromEntries(
        req.headers.cookie.split(";").map((s) => {
          const [k, ...v] = s.trim().split("=");
          return [k, decodeURIComponent((v || []).join("="))];
        })
      );

      userCookie = parsed.__test || "";
    }

    const forwardedCookie = `__test=${userCookie || ""}`;

    console.log(`[m3u8] Cookie used: ${forwardedCookie}`);

    // --- 2) Determine URL to fetch ---
    const playUrl = id
      ? `https://shopnojaal.ct.ws/ayna/play.php?id=${encodeURIComponent(id)}`
      : `https://shopnojaal.ct.ws/ayna/play.php`;

    // --- 3) Browser-like headers ---
    const headers = {
      "cache-control": "no-cache, max-age=0",
      connection: "keep-alive",
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-encoding": "gzip, deflate, br",
      "accept-language": "en-US,en;q=0.9,bn;q=0.8",
      cookie: forwardedCookie,
      dnt: "1",
      pragma: "no-cache",
      referer: playUrl,
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

    // --- 4) Fetch remote page ---
    const response = await fetch(playUrl, {
      headers,
      redirect: "follow"
    });

    let html = await response.text();

    // --- 5) Fix scripts / links for fallback proxy ---

    // Replace aes.js references
    html = html.replace(
      /(src\s*=\s*["'])\/?aes\.js(["'])/gi,
      '$1https://shopnojaal.ct.ws/aes.js$2'
    );

    // Remove anchor tags
    html = html.replace(
      /<a\s+[^>]*href=["'][^"']*["'][^>]*>.*?<\/a>/gis,
      ""
    );

    // Disable JS redirects
    html = html.replace(
      /location\.href\s*=\s*['"][^'"]*['"]/gi,
      "// redirect removed by proxy"
    );

    // --- 6) Extract m3u8 URL ---

    let m3u8Url = null;

    // Case 1: direct URL
    const directMatch = html.match(
      /(https?:\/\/[^'"\s]+\.m3u8[^'"\s]*)/i
    );

    if (directMatch) {
      m3u8Url = directMatch[1];
      console.log("[m3u8] Found direct URL");
    }

    // Case 2: Base64 encoded with atob()
    if (!m3u8Url) {
      const atobMatch = html.match(
        /atob\(["']([^"']+)["']\)/i
      );

      if (atobMatch) {
        try {
          m3u8Url = Buffer.from(
            atobMatch[1],
            "base64"
          ).toString("utf8");

          console.log("[m3u8] Decoded Base64 URL");
        } catch (e) {
          console.error("[m3u8] Base64 decode failed:", e);
        }
      }
    }

    // --- 7) Cleanup URL ---
    if (m3u8Url) {
      m3u8Url = m3u8Url
        .replace(/\\\//g, "/")
        .replace(/([^:]\/)\/+/g, "$1");

      console.log(`[m3u8] Final URL: ${m3u8Url}`);
    }

    // --- 8) Redirect if found ---
    if (id && userCookie && m3u8Url) {
      res.writeHead(302, {
        Location: m3u8Url,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store"
      });

      res.end();
      return;
    }

    // --- 9) Fallback: proxy HTML page ---
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("content-type", "text/html; charset=UTF-8");

    res.status(200).send(html);

  } catch (err) {
    console.error("[m3u8] Error:", err);

    res.status(500).json({
      error: "Internal Server Error",
      message: err.message
    });
  }
}
