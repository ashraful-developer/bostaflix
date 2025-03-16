export default async function handler(req, res) {
    const { channel, id, server } = req.query;

    if (!channel) {
        return res.status(400).json({ error: "Channel parameter is required" });
    }

    try {
        // URL of your M3U playlist
        const m3uUrl = 'https://its-ferdos-alom.top/fredflix.fun/ayna/api.php';

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

        // If a stream URL is found, append the `id` and `server` to the URL and redirect
        if (streamUrl) {
            if (id || server) {
                const queryParams = new URLSearchParams();
                if (id) queryParams.append("channelid", id);
                if (server) queryParams.append("server", server);
                streamUrl = `${streamUrl}&${queryParams.toString()}`;
            }
            return res.redirect(302, streamUrl);
        } else {
            return res.status(404).json({ error: `Channel "${channel}" not found` });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "An error occurred while processing the M3U file." });
    }
}
