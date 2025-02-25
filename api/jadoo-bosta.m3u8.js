export default async function handler(req, res) {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).send("Missing id parameter");
    }

    // Predefined m3u file URL
    const predefinedM3UUrl = "https://its-ferdos-alom.top/Jadoo/api.m3u";
    
    // Fetch the predefined m3u file
    const mainResponse = await fetch(predefinedM3UUrl);
    if (!mainResponse.ok) {
      return res.status(mainResponse.status).send("Failed to fetch predefined m3u");
    }
    const mainM3U = await mainResponse.text();

    // Find the m3u8 URL by matching the id
    const lines = mainM3U.split("\n");
    const baseUrl = predefinedM3UUrl.substring(0, predefinedM3UUrl.lastIndexOf("/") + 1);
    let m3u8Url = null;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(id) && i + 1 < lines.length) {
        let line = lines[i + 1].trim();
        m3u8Url = line.startsWith("http") ? line : baseUrl + line;
        break;
      }
    }

    if (!m3u8Url) {
      return res.status(404).send("No matching m3u8 found");
    }

    // Fetch the m3u8 file
    const m3u8Response = await fetch(m3u8Url);
    if (!m3u8Response.ok) {
      return res.status(m3u8Response.status).send("Failed to fetch m3u8");
    }
    let m3u8Content = await m3u8Response.text();

    // Convert relative URLs in the m3u8 to absolute URLs
    m3u8Content = m3u8Content.replace(/^(?!#)([^:\n]+)$/gm, (match) => {
      return match.startsWith("http") ? match : baseUrl + match;
    });

    // Send the modified m3u8 back to the user
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.status(200).send(m3u8Content);
  } catch (error) {
    res.status(500).send("Server error");
  }
}
