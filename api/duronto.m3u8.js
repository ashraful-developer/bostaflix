export default async function handler(req, res) {
  const httpUrl = "https://cdn.hoichoi24.com/carton-duronto/tracks-v1a1/mono.m3u8";
  const specificBaseUrl = "https://cdn.hoichoi24.com/carton-duronto/tracks-v1a1/"; // Replace with your specific base URL

  try {
    // Fetch the HTTP URL
    const response = await fetch(httpUrl);

    // Check if the response is successful
    if (!response.ok) {
      return res.status(response.status).send('Error fetching the resource');
    }

    // Get the M3U8 file content
    const text = await response.text();

    // Update relative URLs in the M3U8 file with the specific base URL
    const updatedText = text.replace(/^(?!#)(.+)$/gm, (line) => {
      try {
        // Resolve the line as a relative URL against the specific base URL
        const url = new URL(line, specificBaseUrl);
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
