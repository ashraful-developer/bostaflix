export default async function handler(req, res) {
  const httpUrl = "https://cdn.hoichoi24.com/gtv-sports-tv5.hoichoi24.com/tracks-v1a1/mono.m3u8";

  try {
    // Fetch the HTTP URL
    const response = await fetch(httpUrl);

    // Check if the response is successful
    if (!response.ok) {
      return res.status(response.status).send('Error fetching the resource');
    }

    // Get the M3U8 file content
    const text = await response.text();

    // Base URL for resolving relative URLs
    const baseUrl = new URL(httpUrl).origin;

    // Update relative URLs in the M3U8 file
    const updatedText = text.replace(/^(?!#)(.+)$/gm, (line) => {
      try {
        // If the line is a URL, resolve it if it's relative
        const url = new URL(line, baseUrl);
        return url.toString();
      } catch {
        // Return the line as is if it's not a valid URL
        return line;
      }
    });

    // Set CORS headers to allow cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Set the appropriate content-type header
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');

    // Send the modified M3U8 file back to the client
    res.status(200).send(updatedText);

  } catch (error) {
    // Handle any errors during the fetch or processing
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
