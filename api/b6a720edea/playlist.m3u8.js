export default async function handler(req, res) {
  // Allow caching or adjust headers if you want it dynamic
  res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
  res.setHeader("Cache-Control", "no-cache");

  // Generate 6 random segment IDs
  const segments = Array.from({ length: 6 }, (_, i) => {
    const id = Math.random().toString(36).substring(2, 10);
    return `# Segment ${i + 1}\n#EXTINF:6.0,\nhttps://bostaflix.vercel.app/video.mp4?id=${id}`;
  }).join("\n");

  // Construct the M3U8 content
  const playlist = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:6
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:EVENT

${segments}
`;

  res.status(200).send(playlist);
}
