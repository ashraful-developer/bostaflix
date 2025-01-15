export default async function handler(req, res) {
  // Extract query parameters
  const { id, server, referer } = req.query;

  // Validate required parameters
  if (!id || !server) {
    return res.status(400).json({ error: 'Missing required query parameters: id or server' });
  }

  // Construct the target URL based on the server parameter
  const baseUrls = {
    1: "https://bdixtv24.site/toffee/live.php",
    2: "https://t.kyni.us/live.php"
  };
  const targetBaseUrl = baseUrls[server];
  
  if (!targetBaseUrl) {
    return res.status(400).json({ error: 'Invalid server parameter' });
  }

  const targetUrl = `${targetBaseUrl}?id=${encodeURIComponent(id)}`;

  try {
    // Fetch the target URL with a custom Referer header if provided
    const headers = {};
    if (referer) {
      headers['Referer'] = referer;
    }

    const response = await fetch(targetUrl, { headers });

    // Check if the response is successful
    if (!response.ok) {
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
