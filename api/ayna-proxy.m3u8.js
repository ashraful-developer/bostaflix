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

    // Step 2: Find channel by title (case-insensitive)
    const channel = json.data.list.find(entry => entry.title.toLowerCase() === id.toLowerCase());
    if (!channel) {
      return res.status(404).send("Channel title not found");
    }

    const realId = channel.id;

    // Step 3: Construct stream URL directly
    const streamUrl = `https://bostaflix-ayna.global.ssl.fastly.net/live.php?Somesia=${realId}`;

    // Redirect to the stream URL
    return res.redirect(302, streamUrl);

  } catch (err) {
    console.error("Error:", err);
    return res.status(500).send("Internal server error");
  }
}
