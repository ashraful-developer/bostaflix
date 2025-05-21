export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).send("Missing 'id' query parameter");
  }

  try {
    console.log(`Fetching API JSON...`);
    const jsonRes = await fetch("https://stream-cdn-bostaflix.global.ssl.fastly.net/ayna/api.json");
    if (!jsonRes.ok) {
      console.error("Failed to fetch JSON:", jsonRes.status);
      return res.status(502).send("Failed to fetch API JSON");
    }
    const jsonData = await jsonRes.json();

    console.log(`Searching for ID: ${id}`);
    const item = jsonData.find(entry => entry.id === id);
    if (!item) {
      console.error("ID not found in JSON");
      return res.status(404).send("ID not found");
    }

    const playUrl = `https://re.fredflix.fun/ayna/play.php?id=${id}`;
    console.log(`Fetching play page: ${playUrl}`);
    const pageRes = await fetch(playUrl);
    if (!pageRes.ok) {
      console.error("Failed to fetch play.php page:", pageRes.status);
      return res.status(502).send("Failed to fetch player page");
    }

    const html = await pageRes.text();

    console.log(`Searching for .m3u8 in HTML...`);
    const m3u8Match = html.match(/https:\/\/[^"'<>]+\.m3u8[^"'<>]*/);
    if (!m3u8Match) {
      console.error("No .m3u8 URL found in HTML");
      return res.status(500).send("Stream URL not found");
    }

    const m3u8Url = m3u8Match[0];
    console.log(`Redirecting to m3u8 URL: ${m3u8Url}`);
    return res.redirect(302, m3u8Url);

  } catch (err) {
    console.error("Unhandled error:", err);
    return res.status(500).send("Internal server error");
  }
}
