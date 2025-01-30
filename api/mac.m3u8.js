export default function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).send("Missing required 'id' query parameter");
  }

  const baseTsUrl = `https://allinonereborn.com/test.m3u8/ts.php?ts=https://starshare.live/live/KVSingh/KVSingh/${id}_`;
  const mediaSequence = Math.floor(Date.now() / 10); // Slower increment to simulate live
  const now = new Date();
  const randomNumber = `${now.getMinutes()}${now.getSeconds()}`; // Minute + Second format
  const duration = (Math.random() * 10).toFixed(2); // Random duration

  const m3u8Content = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:12
#EXT-X-MEDIA-SEQUENCE:${mediaSequence}
#EXTINF:12,
${baseTsUrl}${randomNumber}.ts`;

  res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
  res.status(200).send(m3u8Content);
}
