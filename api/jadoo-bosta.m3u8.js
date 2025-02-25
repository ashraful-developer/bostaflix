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
    const m3uBaseUrl = new URL(predefinedM3UUrl).origin + "/";
    let masterM3u8Url = null;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(id) && i + 1 < lines.length) {
        let line = lines[i + 1].trim();
        masterM3u8Url = line.startsWith("http") ? line : m3uBaseUrl + line;
        break;
      }
    }

    if (!masterM3u8Url) {
      return res.status(404).send("No matching master m3u8 found");
    }

    // Fetch the master m3u8 file
    const masterResponse = await fetch(masterM3u8Url);
    if (!masterResponse.ok) {
      return res.status(masterResponse.status).send("Failed to fetch master m3u8");
    }
    let masterM3u8Content = await masterResponse.text();

    const masterBaseUrl = new URL(masterM3u8Url).origin + "/";
    let chunkM3u8Url = null;

    // Find the chunk m3u8 URL in the master playlist
    const masterLines = masterM3u8Content.split("\n");
    for (let line of masterLines) {
      line = line.trim();
      if (!line.startsWith("#") && line.includes(".m3u8")) {
        chunkM3u8Url = line.startsWith("http") ? line : masterBaseUrl + line;
        break;
      }
    }

    if (!chunkM3u8Url) {
      return res.status(404).send("No chunk m3u8 found in master");
    }

    // Fetch the chunk m3u8 file
    const chunkResponse = await fetch(chunkM3u8Url);
    if (!chunkResponse.ok) {
      return res.status(chunkResponse.status).send("Failed to fetch chunk m3u8");
    }
    let chunkM3u8Content = await chunkResponse.text();

    const chunkBaseUrl = new URL(chunkM3u8Url).origin + "/";
    
    // Convert relative URLs in the chunk m3u8 to absolute URLs
    chunkM3u8Content = chunkM3u8Content.replace(/^(?!#)([^:\n]+)$/gm, (match) => {
      return match.startsWith("http") ? match : chunkBaseUrl + match;
    });

    // Send the modified chunk m3u8 back to the user
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.status(200).send(chunkM3u8Content);
  } catch (error) {
    res.status(500).send("Server error");
  }
}
