export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).send("Missing 'id' query parameter");
  }

  try {
    // Step 1: Get JSON
    const jsonRes = await fetch("https://stream-cdn-bostaflix.global.ssl.fastly.net/ayna/api.json");
    if (!jsonRes.ok) {
      return res.status(502).send("Failed to fetch API JSON");
    }
    const json = await jsonRes.json();

    // Step 2: Find by title
    const channel = json.data.list.find(entry => entry.title.toLowerCase() === id.toLowerCase());
    if (!channel) {
      return res.status(404).send("Channel title not found");
    }

    const realId = channel.id;

    // Step 3: Follow redirect from watch.php
    const playRes = await fetch(`https://tv.bdixtv24.com/ayna/watch.php?id=${realId}&format=.m3u8`, {
      method: "GET",
      redirect: "follow"
    });

    if (!playRes.ok) {
      return res.status(502).send("Failed to fetch redirected stream");
    }

    let finalUrl = playRes.url;

    // Optional: Replace CDN host if needed
    finalUrl = finalUrl
      .replace("tvsen6.aynascope.net", "tvsen6.aynaott.com")
      .replace("tvsen2.aynascope.net", "tvsen2.aynaott.com")
      .replace("tvsen5.aynascope.net", "tvsen5.aynaott.com");

    // Step 4: Send final URL as redirect
    return res.redirect(302, finalUrl);

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).send("Internal server error");
  }
}
