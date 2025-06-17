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

    // Step 2: Find by title instead of id
    const channel = json.data.list.find(entry => entry.title.toLowerCase() === id.toLowerCase());
    if (!channel) {
      return res.status(404).send("Channel title not found");
    }

    const realId = channel.id;

    // Step 3: Fetch play.php
    const playRes = await fetch(`https://tv.bdixtv24.com/ayna/watch.php?id=${realId}&format=.m3u8`);
    if (!playRes.ok) {
      return res.status(502).send("Failed to fetch player page");
    }

    const html = await playRes.text();

    // Step 4: Extract m3u8
    const m3u8Match = html.match(/https:\/\/[^"'<>]+\.m3u8[^"'<>]*/);
    if (!m3u8Match) {
      return res.status(500).send("Stream URL not found");
    }

    let streamUrl = m3u8Match[0];

    // Step 5: Replace host if needed
    streamUrl = streamUrl
      .replace("tvsen6.aynascope.net", "tvsen6.aynaott.com")
      .replace("tvsen2.aynascope.net", "tvsen2.aynaott.com")
      .replace("tvsen5.aynascope.net", "tvsen5.aynaott.com");

    // Step 6: Follow redirect manually
    const streamRes = await fetch(streamUrl, {
      method: "GET",
      redirect: "follow"
    });

    if (!streamRes.ok) {
      return res.status(502).send("Failed to resolve stream URL");
    }

    // The final redirected URL is in .url
    const finalUrl = streamRes.url;

    // Respond with the resolved final URL
    return res.status(200).json({ url: finalUrl });

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).send("Internal server error");
  }
}
