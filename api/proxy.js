export default async function proxy(req, res) {
  let { url, server = '1', channelid } = req.query; // Default server = '1' if not provided, channelid as a required parameter

  if (!url || !channelid) {
    return res.status(400).send('Missing URL or channelid parameter');
  }

  try {
    // Fetch the original m3u8 file
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Referer': 'https://t.bdixtv24.com/?play=sonyaath',
        'User-Agent': 'Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.188 Safari/537.36 CrKey/1.54.250320',
      },
    });

    if (!response.ok) {
      return res.status(response.status).send('Error fetching the resource');
    }

    // Get the m3u8 content as text
    const m3u8Content = await response.text();

    // Extract the first non-comment URL from the playlist
    const lines = m3u8Content.split('\n').map(line => line.trim());
    const nestedUrl = lines.find(line => line && !line.startsWith('#')); // Find first non-comment line

    if (!nestedUrl) {
      return res.status(400).send('No valid stream URL found in m3u8 file');
    }

    // Construct the final URL with channelid and custom server prefix
    const finalUrl = `https://tvs${server}.aynaott.com/${channelid}/${nestedUrl.startsWith('http') ? nestedUrl.replace(/^https?:\/\//, '') : nestedUrl}`;

    // Redirect to the modified URL
    res.redirect(302, finalUrl);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
