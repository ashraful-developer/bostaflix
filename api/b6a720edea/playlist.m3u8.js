export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
  res.setHeader("Cache-Control", "no-cache");

  const playlist = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:6

#EXTINF:6.0,
https://bostaflix.vercel.app/api/video.ts
#EXT-X-ENDLIST
`;

  res.status(200).send(playlist);
}
