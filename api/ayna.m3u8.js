export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).send("Missing id");
  }

  try {
    // Step 1: Fetch JSON
    const jsonRes = await fetch("https://stream-cdn-bostaflix.global.ssl.fastly.net/ayna/api.json");
    const data = await jsonRes.json();

    // Step 2: Match ID
    const matched = data.find(item => item.id === id);
    if (!matched) {
      return res.status(404).send("ID not found in JSON");
    }

    // Step 3: Fetch HTML page
    const pageRes = await fetch(`https://re.fredflix.fun/ayna/play.php?id=${id}`);
    const html = await pageRes.text();

    // Step 4: Extract .m3u8 URL
    const m3u8Match = html.match(/https?:\/\/[^"']+\.m3u8[^"']*/);
    if (!m3u8Match) {
      return res.status(500).send("No m3u8 URL found");
    }

    const m3u8Url = m3u8Match[0];

    // Step 5: Redirect to m3u8
    return res.redirect(302, m3u8Url);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal server error");
  }
}
