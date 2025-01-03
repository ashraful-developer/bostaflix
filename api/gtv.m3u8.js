export default async function handler(req, res) {
  // Fixed URL to proxy from
  const httpUrl = "https://jadoo.iptvbd.xyz/jadoo.php?id=gazi_tv_hd";

  try {
    // Fetch the HTTP URL
    const response = await fetch(httpUrl);

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
