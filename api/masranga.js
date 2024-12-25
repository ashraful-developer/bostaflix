export default async function handler(req, res) {
  // Fixed URL to proxy from
  const httpUrl = "https://mtv.sunplex.live/MAASRANGA-TV/index.m3u8";
  const baseDomain = new URL(httpUrl).origin;

  try {
    // Fetch the HTTP URL with custom headers
    const response = await fetch(httpUrl, {
      headers: {
        'Referer': 'https://maasranga.tv/', // Replace with the required referer
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36' // Replace with the desired User-Agent
      }
    });

    // Check if the response is successful
    if (!response.ok) {
      return res.status(response.status).send('Error fetching the resource');
    }

    // Set CORS headers to allow cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Get the content type of the response
    const contentType = response.headers.get('content-type');
    res.setHeader('Content-Type', contentType);

    if (contentType && contentType.includes('application/vnd.apple.mpegurl')) {
      // If the content is an M3U8 file, process it to prepend the domain
      const text = await response.text();
      const modifiedText = text.replace(/(^(?!https?:\/\/)(\/[^ \r\n]+))/gm, `${baseDomain}$1`);
      return res.status(200).send(modifiedText);
    }

    // For non-text responses, just proxy the data as-is
    const body = await response.arrayBuffer();
    res.status(200).send(Buffer.from(body));
  } catch (error) {
    // Handle any errors during the fetch or streaming process
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
