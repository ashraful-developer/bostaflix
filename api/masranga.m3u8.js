export default async function handler(req, res) {
  // Define the specific URL to fetch the m3u8 content
  const m3u8Url = "https://bosta-live.vercel.app/api/masranga.m3u8";

  try {
    // Fetch the m3u8 file content
    const response = await fetch(m3u8Url);

    if (!response.ok) {
      return res.status(response.status).send("Failed to fetch the m3u8 file.");
    }

    const m3u8Content = await response.text();

    // Process the content
    const modifiedContent = m3u8Content.replace(
      /(https?:\/\/.+\/)([^\/]+\/)?(\d{2}\/)(0*)(\d+\.\w+)/g,
      (_, base, optionalDir, subDir, leadingZeros, file) => {
        const updatedFile = file.replace(/^0/, ""); // Remove one leading zero
        return `${base}${optionalDir || ""}${subDir.replace(/\/$/, "")}${updatedFile}`;
      }
    );

    // Return the modified m3u8 content
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.status(200).send(modifiedContent);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while processing the m3u8 file.");
  }
}
