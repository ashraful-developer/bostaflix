// /pages/api/ayna.js

export default async function handler(req, res) {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).send("Missing id");
    }

    const url = `https://xfireflix.ct.ws/ayna/play.php?id=${encodeURIComponent(id)}`;

    const response = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/142 Safari/537.36",
      },
    });

    let html = await response.text();

    // Replace remote play.php → local API endpoint
    html = html.replace(
      /https:\/\/xfireflix\.ct\.ws\/ayna\/play\.php\?id=([^"'&]+)/g,
      "/api/ayna.m3u8?id=$1"
    );

    // Send modified HTML back to browser
    res.setHeader("Content-Type", "text/html; charset=UTF-8");
    res.send(html);

  } catch (err) {
    console.error(err);
    res.status(500).send("Proxy error");
  }
}
