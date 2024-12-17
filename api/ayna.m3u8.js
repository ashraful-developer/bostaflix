export default async function handler(req, res) {
    const { channel } = req.query;

    // Validate input
    if (!channel) {
        return res.status(400).json({ error: "Please provide a 'channel' query parameter." });
    }

    try {
        // URL of the M3U playlist
        const m3uUrl = 'https://path-to-your-m3u-playlist-file.com/playlist.m3u';

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
            // Look for the #EXTINF line containing the channel name
            if (lines[i].startsWith('#EXTINF') && lines[i].includes(channel)) {
                // Extract the logo URL
                const logoMatch = lines[i].match(/tvg-logo="(.*?)"/);
                logoUrl = logoMatch ? logoMatch[1] : '';

                // Look for the stream URL on the following lines
                for (let j = i + 1; j < lines.length; j++) {
                    if (lines[j].startsWith('http')) {
                        streamUrl = lines[j].split('|')[0].trim(); // Ignore any headers
                        found = true;
                        break;
                    }
                }
                break;
            }
        }

        if (!found) {
            return res.status(404).json({ error: "Channel URL not found." });
        }

        // Return the channel info
        return res.status(200).json({ channel, streamUrl, logoUrl });
    } catch (error) {
        return res.status(500).json({ error: "An error occurred while processing your request." });
    }
}
