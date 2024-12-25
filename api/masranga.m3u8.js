export default async function handler(req, res) {
  const httpUrl = "https://mtv.sunplex.live/MAASRANGA-TV/index.m3u8";
  const baseDomain = new URL(httpUrl).origin;

  try {
    const response = await fetch(httpUrl, {
      headers: {
        'Referer': 'https://maasranga.tv/', // Replace with the required referer
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.error('Response Status:', response.status);
      console.error('Response Headers:', [...response.headers.entries()]);
      return res.status(response.status).send('Error fetching the resource');
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const contentType = response.headers.get('content-type');
    res.setHeader('Content-Type', contentType);

    if (contentType && contentType.includes('application/vnd.apple.mpegurl')) {
      const text = await response.text();
      const modifiedText = text.replace(/(^(?!https?:\/\/)(\/[^ \r\n]+))/gm, `${baseDomain}$1`);
      return res.status(200).send(modifiedText);
    }

    const body = await response.arrayBuffer();
    res.status(200).send(Buffer.from(body));
  } catch (error) {
    console.error('Fetch Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
