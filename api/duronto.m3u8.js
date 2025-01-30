export default function handler(req, res) {
  const baseTsUrl = "https://starshare.live/live/KVSingh/KVSingh/433_";
  const segments = [];
  const mediaSequence = Math.floor(Date.now() / 1000); // Using timestamp for dynamic sequence

  for (let i = 0; i < 5; i++) {
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    const duration = (Math.random() * 10).toFixed(2); // Random duration
    segments.push(`#EXTINF:${duration},\n${baseTsUrl}${randomNumber}.ts`);
  }

  const m3u8Content = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-MEDIA-SEQUENCE:${mediaSequence}
${segments.join('\n')}
#EXT-X-ENDLIST`;

  res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
  res.status(200).send(m3u8Content);
}
