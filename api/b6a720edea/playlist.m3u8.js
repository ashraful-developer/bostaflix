export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
  res.setHeader("Cache-Control", "no-cache");

  // Generate a random ID for uniqueness (optional)
  const id = Math.random().toString(36).substring(2, 10);

  const playlist = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:6
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:EVENT

#EXTINF:6.0,
https://bostaflix.vercel.app/api/video.mp4
#EXT-X-ENDLIST
`;

  res.status(200).send(playlist);
}
