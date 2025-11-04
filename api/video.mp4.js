export default async function handler(req, res) {
  const r = await fetch('https://bostaflix.vercel.app/video.mp4', {
    headers: { range: req.headers.range || '' },
  });
  res.status(r.status);
  for (const [k, v] of r.headers) res.setHeader(k, v);
  r.body.pipe(res);
}
