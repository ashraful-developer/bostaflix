export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).send('Missing URL parameter.');
    }

    // Fetch the original m3u8 file
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).send(`Failed to fetch m3u8: ${response.statusText}`);
    }

    const baseUrl = url.split('?')[0].substring(0, url.split('?')[0].lastIndexOf('/') + 1);
    const content = await response.text();

    // Rewrite URLs in the m3u8 file
    const rewrittenContent = content.replace(/^(?!#)(.*?)(\\.m3u8|\\.ts)$/gm, (match, relativePath, extension) => {
      const resolvedUrl = new URL(relativePath, baseUrl).href;
      if (extension === '.m3u8') {
        return `https://bostaflix.vercel.app/api/proxy.m3u8?url=${encodeURIComponent(resolvedUrl)}`;
      } else if (extension === '.ts') {
        return resolvedUrl;
      }
      return match;
    });

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.status(200).send(rewrittenContent);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
}
