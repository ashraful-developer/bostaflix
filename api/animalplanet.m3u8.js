export default async function handler(req, res) {
  const httpUrl = "https://bldcmprod-cdn.toffeelive.com/cdn/live/animal_planet_sd/playlist.m3u8";
  const baseDomain = new URL(httpUrl).origin;

  const headers = {
    'Referer': 'BuddyXiptv', // Custom referrer provided in the input
    'Cookie': "Edge-Cache-Cookie=URLPrefix=aHR0cHM6Ly9ibGRjbXByb2QtY2RuLnRvZmZlZWxpdmUuY29tLw:Expires=1735273386:KeyName=prod_linear:Signature=1Phpd6zOszn_h3Dg8EJgjWc39TwbloMYN2V-jTtBZc_qQmLUcn9RnYspE2ZztnxE1OSE5-juDQAVyrNLYtmsAg" // Custom cookie
  };

  if (!headers['User-Agent']) {
    headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'; // Default user agent
  }

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchWithRetries = async (url, options, retries = 3, delayMs = 3000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.ok) {
          return response;
        }
        console.warn(`Attempt ${i + 1} failed: ${response.status} - Retrying in ${delayMs / 1000} seconds...`);
      } catch (error) {
        console.error(`Attempt ${i + 1} failed: ${error.message} - Retrying in ${delayMs / 1000} seconds...`);
      }
      await delay(delayMs);
    }
    throw new Error(`Failed to fetch ${url} after ${retries} attempts`);
  };

  try {
    const response = await fetchWithRetries(httpUrl, { headers });

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
