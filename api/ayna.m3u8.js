import crypto from "crypto";

export default async function handler(req, res) {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Missing id" });

    const playUrl = `https://xfireflix.ct.ws/ayna/play.php?id=${encodeURIComponent(id)}`;

    let headers = {
      'user-agent': 'Mozilla/5.0 (Linux; Android 13)',
      'accept': 'text/html',
      'cookie': ''
    };

    let response = await fetch(playUrl, { headers });
    let html = await response.text();

    // Detect if page contains JS token generator
    const jsMatch = html.match(/toNumbers\("([0-9a-f]+)"\).*toNumbers\("([0-9a-f]+)"\).*toNumbers\("([0-9a-f]+)"\)/s);
    if (jsMatch) {
      const [_, keyHex, ivHex, cipherHex] = jsMatch;

      // Convert hex to bytes
      const key = Buffer.from(keyHex, "hex");
      const iv = Buffer.from(ivHex, "hex");
      const cipher = Buffer.from(cipherHex, "hex");

      // Decrypt using AES-128-CBC
      const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
      let decrypted = Buffer.concat([decipher.update(cipher), decipher.final()]);
      const token = decrypted.toString("hex");

      // Set cookie header for next request
      headers.cookie = `__test=${token}`;

      // Re-fetch page with cookie
      response = await fetch(playUrl, { headers });
      html = await response.text();
    }

    // Extract m3u8 URL
    let match = html.match(/(https?:\/\/[^'"]+\.m3u8[^'"]*)/);
    if (!match) return res.status(404).json({ error: "No m3u8 URL found" });

    let m3u8Url = match[1].replace(/\\\//g, "/").replace(/([^:]\/)\/+/g, "$1");

    res.writeHead(302, { Location: m3u8Url });
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
