export default async function handler(req, res) {
    // Hardcoded M3U8 URL
    const m3u8Url = "http://stvlive.net:8080/tsports2/tracks-v1a1/mono.m3u8";
    const prefix = "https://allinonereborn.com/test.m3u8/ts.php?ts=http://stvlive.net:8080/tsports2/tracks-v1a1/";

    try {
        // Fetch the M3U8 playlist
        const response = await fetch(m3u8Url);
        if (!response.ok) throw new Error("Failed to fetch M3U8");
        
        let playlist = await response.text();
        
        // Process the M3U8 file
        let updatedPlaylist = playlist.split("\n").map(line => {
            return (line.endsWith(".ts") || line.includes(".ts?")) ? prefix + encodeURIComponent(line) : line;
        }).join("\n");
        
        // Return the modified playlist
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
        res.status(200).send(updatedPlaylist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
