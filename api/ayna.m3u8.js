export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    res.status(400).send("Missing 'id' query parameter.");
    return;
  }

  try {
    // Step 1: Fetch the channel list page
    const mainPageResponse = await fetch('https://stream-cdn-bostaflix.global.ssl.fastly.net/ayna/');
    const mainHtml = await mainPageResponse.text();

    // Step 2: Extract the player ID associated with the given channel ID
    const regex = new RegExp(
      `<div class="card[^>]*?" onclick="openPlayer\\('([a-f0-9\\-]+)'\\)">\\s*<img[^>]*?/>\\s*<div class="card-body[^>]*?>\\s*<small><b>${id}</b></small>`,
      'i'
    );
    const match = mainHtml.match(regex);

    if (!match || !match[1]) {
      res.status(404).send(`Channel '${id}' not found.`);
      return;
    }

    const playerId = match[1];

    // Step 3: Fetch the player page for the extracted ID
    const playPageResponse = await fetch(`https://stream-cdn-bostaflix.global.ssl.fastly.net/ayna/play.php?id=${playerId}`);
    const playHtml = await playPageResponse.text();

    // Step 4: Extract the .m3u8 stream URL from the <source> tag
    const streamMatch = playHtml.match(/<source[^>]+src="([^"]+\.m3u8[^"]*)"/i);

    if (!streamMatch || !streamMatch[1]) {
      res.status(500).send("Stream URL not found in play.php response.");
      return;
    }

    const streamUrl = streamMatch[1];

    // Step 5: Redirect the client to the actual stream
    res.writeHead(302, { Location: streamUrl });
    res.end();

  } catch (err) {
    res.status(500).send("Server Error: " + err.message);
  }
}
