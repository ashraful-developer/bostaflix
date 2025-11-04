export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
  res.setHeader('Cache-Control', 'no-cache');

  const playlist = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:8
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:8.0,
https://bostaflix.vercel.app/video.mp4
#EXT-X-ENDLIST`;

  res.status(200).send(playlist);
}
