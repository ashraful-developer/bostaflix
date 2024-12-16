export default async function handler(req, res) {
  // Fixed URL to proxy from
  const httpUrl = "https://mafiatv.live/ayna/stream.m3u8?id=37&e=.m3u8";

  try {
    // Fetch the HTTP URL with a custom Referer header
    const response = await fetch(httpUrl, {
      method: 'GET',
      headers: {
        'Referer': 'https://mafiatv.live/ayna/?watch=37', // Replace with your desired referrer URL
        'User-Agent': 'Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.188 Safari/537.36 CrKey/1.54.250320', // Correct User-Agent string
      },
    });

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
