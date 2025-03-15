export default async function handler(req, res) {
    const { channel } = req.query;

    if (!channel) {
        return res.status(400).json({ error: "Channel parameter is required" });
    }

    try {
        // URL of your M3U playlist
        const m3uUrl = 'https://bd-live-streaming.xyz/stream/api.php';

        // Fetch the M3U file content
        const response = await fetch(m3uUrl);
        if (!response.ok) {
            return res.status(500).json({ error: "Failed to fetch the M3U playlist." });
        }

        const m3uContent = await response.text();

        // Split the content by lines
        const lines = m3uContent.split('\n').map(line => line.trim()).filter(line => line !== '');

        let streamUrl = null;
        let includeNextUrl = false;

        // Iterate through the lines to find the channel and its URL
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // If the line contains the channel name
            if (line.includes(channel)) {
                includeNextUrl = true; // The next line will contain the URL
            }

            // If we should include the next URL (the stream URL)
            if (includeNextUrl && line.startsWith('http')) {
                // Remove the referer query parameter from the URL
                streamUrl = `proxy?url=${line.split('|')[0]}`; // This adds 'proxy?url=' before the URL
                break; // Exit loop after finding the first match
            }
        }

        // If a stream URL is found, redirect to it
        if (streamUrl) {
            return res.redirect(302, streamUrl);
        } else {
            return res.status(404).json({ error: `Channel "${channel}" not found` });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "An error occurred while processing the M3U file." });
    }
}
