export default async function handler(req, res) {
  res.writeHead(302, {
    Location: 'https://bostaflix.vercel.app/video.mp4',
  });
  res.end();
}
