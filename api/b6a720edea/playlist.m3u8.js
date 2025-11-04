export default async function handler(req, res) {
  res.writeHead(302, {
    Location: 'https://livecdn-bostaflix.global.ssl.fastly.net/video.mp4',
  });
  res.end();
}
