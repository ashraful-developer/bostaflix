export default async function handler(req, res) {
  const { id, server, referer, baseUrl } = req.query;

  // Validate required parameters
  if (!id || !server || !baseUrl) {
    return res.status(400).json({ error: 'Missing required query parameters: id, server, or baseUrl' });
  }

  // Construct the target URL based on the server parameter
  const baseUrls = {
    1: "https://t.kyni.us/live.php?id=",
    2: "https://uspro.click/toffee/tango/?id="
  };
  const targetBaseUrl = baseUrls[server];

  if (!targetBaseUrl) {
    return res.status(400).json({ error: 'Invalid server parameter' });
  }

  const targetUrl = `${targetBaseUrl}?id=${encodeURIComponent(id)}`;

  try {
    // Fetch the M3U playlist
    const headers = {};
    if (referer) {
      headers['Referer'] = referer;
    }

    const response = await fetch(targetUrl, { headers });

    if (!response.ok) {
      return res.status(response.status).send('Error fetching the resource');
    }

    // Transform the M3U content
    let m3uContent = await response.text();
    const lines = m3uContent.split('\n');
    const transformedLines = lines.map(line => {
      // Prepend the base URL to relative URLs
      if (line.startsWith('live.php')) {
        return `${baseUrl}/${line}`;
      }
      return line;
    });

    const transformedM3UContent = transformedLines.join('\n');

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Set content-type header and send the modified playlist
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.status(200).send(transformedM3UContent);

  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
