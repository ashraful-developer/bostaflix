// Vercel serverless function
export default function handler(req, res) {
  // Set the response content type to indicate an M3U8 file
  res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');

  // Validate and retrieve the GMT parameter from the query
  const { gmt } = req.query;
  if (!gmt || isNaN(gmt)) {
    res.status(400).send("Invalid or missing 'gmt' parameter.");
    return;
  }

  const gmtOffset = parseInt(gmt, 10); // GMT offset in hours

  // Convert the GMT offset to seconds
  const currentUtcTime = Math.floor(Date.now() / 1000); // Current UTC time in seconds
  const gmtInSeconds = currentUtcTime + gmtOffset * 3600;

  // Define the base URL for the segments
  const baseUrl = "https://mtv.sunplex.live/MAASRANGA-TV/tracks-v1a1";

  // Calculate the timestamp for the program date
  const programDateTime = new Date(gmtInSeconds * 1000).toISOString();

  // Define the number of segments and their duration
  const segmentsCount = 4;
  const segmentDuration = 1.2; // seconds

  // Start generating the M3U8 content
  let m3u8Content = "#EXTM3U\n";
  m3u8Content += "#EXT-X-TARGETDURATION:2\n";
  m3u8Content += "#EXT-X-VERSION:3\n";
  m3u8Content += `#EXT-X-MEDIA-SEQUENCE:${Math.floor(gmtInSeconds / segmentDuration)}\n`;
  m3u8Content += `#EXT-X-PROGRAM-DATE-TIME:${programDateTime}\n`;

  // Generate the segments
  for (let i = 0; i < segmentsCount; i++) {
    const segmentTime = new Date((gmtInSeconds + i * segmentDuration) * 1000)
      .toISOString()
      .replace(/[-T:.Z]/g, "/")
      .replace(/\/$/, ""); // Convert to desired format

    m3u8Content += `#EXTINF:${segmentDuration},\n`;
    m3u8Content += `${baseUrl}/${segmentTime}-01200.ts\n`;
  }

  // Send the M3U8 content as the response
  res.status(200).send(m3u8Content);
}
