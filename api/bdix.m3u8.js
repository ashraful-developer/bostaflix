export default async function handler(req, res) {
  try {
    // Example: /api/fetch?id=DBC News
    const { id } = req.query;

    if (!id) {
      res.status(400).send("Missing id parameter");
      return;
    }

    // Form data: ch_name = id
    const formBody = new URLSearchParams();
    formBody.append("ch_name", id);

    const response = await fetch("https://plusbox.tv/token.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Accept": "*/*",
        "Origin": "https://plusbox.tv",
        "Referer": "https://plusbox.tv/",
      },
      body: formBody.toString(),
    });

    const data = await response.text();

    res.status(response.status).send(data);
  } catch (err) {
    res.status(500).send("Fetch failed: " + err.message);
  }
}
