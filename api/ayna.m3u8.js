// /api/ayna.js

export default async function handler(req, res) {
    const { channel, e } = req.query;

    // Validate input
    if (!channel || !e) {
        return res.status(400).json({ error: "Please provide both 'channel' and 'e' query parameters." });
    }

    try {
        // URL of the M3U playlist
        const m3uUrl = 'https://byte-capsule.vercel.app/api/aynaott/hybrid.m3u';

        // Fetch the M3U content
        const response = await fetch(m3uUrl);
        if (!response.ok) {
            return res.status(500).json({ error: "Failed to fetch the M3U playlist." });
        }

        const m3uContent = await response.text();

        // Search for the channel and URL
        const lines = m3uContent.split('\n');
        let found = false;
        let streamUrl = '';

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(channel)) {
                // Look for the next line containing the URL
                for (let j = i + 1; j < lines.length; j++) {
                    if (lines[j].trim().endsWith(e)) {
                        streamUrl = lines[j].trim();
                        found = true;
                        break;
                    }
                }
            }
            if (found) break;
        }

        if (!streamUrl) {
            return res.status(404).json({ error: "Channel URL not found." });
        }

        return res.status(200).json({ channel, url: streamUrl });
    } catch (error) {
        return res.status(500).json({ error: "An error occurred while processing your request." });
    }
}
