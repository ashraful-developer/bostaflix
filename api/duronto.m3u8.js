export default async function handler(req, res) {
  // Fixed URL to proxy from
  const httpUrl = "https://tvs1.aynaott.com/durontotv/index.m3u8?hdnts=st=1736502895~exp=1736546095~acl=/byte-capsule/*~data=103.185.251.136-WEB~hmac=5631f695d500e11509f4c0f2c4d9a92c29af1ff8aa65664dfbe5f58cbeb62254";

  try {
    // Define request headers
    const requestHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
      'Accept': 'application/vnd.apple.mpegurl',
      'Referer': 'https://cloudtv.akamaized.net/',
    };

    // Fetch the HTTP URL with headers
    const response = await fetch(httpUrl, {
      method: 'GET',
      headers: requestHeaders,
    });

    // Check if the response is successful
    if (!response.ok) {
      // Send 404 for not found
      if (response.status === 404) {
        return res.status(404).send('Resource not found');
      }
      // Send 403 for forbidden
      if (response.status === 403) {
        return res.status(403).send('Access to the resource is forbidden');
      }
      // Send a general error for other status codes
      return res.status(response.status).send('Error fetching the resource');
    }

    // Set CORS headers to allow cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Set the appropriate content-type header from the proxied resource
    res.setHeader('Content-Type', response.headers.get('content-type'));

    // Send the response data back to the client
    const body = await response.arrayBuffer();
    res.status(200).send(Buffer.from(body));
  } catch (error) {
    // Handle any errors during the fetch or streaming process
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
