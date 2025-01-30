export default function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).send("Missing required 'id' query parameter");
  }

  const baseTsUrl = `https://allinonereborn.com/test.m3u8/ts.php?ts=https://starshare.live/live/KVSingh/KVSingh/${id}_`;
  const segments = [];
  const mediaSequence = Math.floor(Date.now() / 1000); // Using timestamp for dynamic sequence

  for (let i = 0; i < 5; i++) {
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    const duration = (Math.random() * 10).toFixed(2); // Random duration
    segments.push(`#EXTINF:${duration},\n${baseTsUrl}${randomNumber}.ts`);
  }

  const m3u8Content = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:${mediaSequence}
${segments.join('\n')}
#EXT-X-ENDLIST`;

  res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
  res.status(200).send(m3u8Content);
}
