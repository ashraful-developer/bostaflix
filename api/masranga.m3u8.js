export default async function handler(req, res) {
  const httpUrl = "https://mtv.sunplex.live/MAASRANGA-TV/index.m3u8";
  const baseDomain = new URL(httpUrl).origin;

  try {
    const response = await fetch(httpUrl, {
      headers: {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8',
        'Connection': 'keep-alive',
        'DNT': '1',
        'Host': 'mtv.sunplex.live',
        'Origin': 'https://maasranga.tv',
        'Referer': 'https://maasranga.tv/',
        'Sec-CH-UA': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'Sec-CH-UA-Mobile': '?1',
        'Sec-CH-UA-Platform': '"Android"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
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
