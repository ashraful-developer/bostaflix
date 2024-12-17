// /api/ayna.js

export default async function handler(req, res) {
    const { channel } = req.query;

    // Validate input
    if (!channel) {
        return res.status(400).json({ error: "Please provide a 'channel' query parameter." });
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

        // Split the content by lines
        const lines = m3uContent.split('\n');
        let found = false;
        let streamUrl = '';
        let logoUrl = '';

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(`#EXTINF`) && lines[i].includes(channel)) {
                // Extract the logo URL from the metadata
                const logoMatch = lines[i].match(/tvg-logo="(.*?)"/);
                logoUrl = logoMatch ? logoMatch[1] : '';

                // Fetch the next line as the stream URL
                if (lines[i + 1] && lines[i + 1].startsWith('http')) {
                    streamUrl = lines[i + 1].trim();
                    found = true;
                }
                break;
            }
        }

        if (!found) {
            return res.status(404).json({ error: "Channel URL not found." });
        }

        // Return the stream URL and logo
        return res.status(200).json({ channel, streamUrl, logoUrl });
    } catch (error) {
        return res.status(500).json({ error: "An error occurred while processing your request." });
    }
}
