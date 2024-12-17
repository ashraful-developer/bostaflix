export default async function handler(req, res) {
    const { channel } = req.query;

    if (!channel) {
        return res.status(400).json({ error: "Channel parameter is required" });
    }

    try {
        // URL of your M3U playlist
        const m3uUrl = 'https://byte-capsule.vercel.app/api/aynaott/hybrid.m3u';

        // Fetch the M3U file content
        const response = await fetch(m3uUrl);
        if (!response.ok) {
            return res.status(500).json({ error: "Failed to fetch the M3U playlist." });
        }

        const m3uContent = await response.text();

        // Split the content by lines
        const lines = m3uContent.split('\n').map(line => line.trim()).filter(line => line !== '');

        let output = [];
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
                let cleanedUrl = line.split('|')[0]; // This removes everything after the pipe symbol (referer and other parameters)

                // Create EXTINF tag (specify the duration, e.g., -1 for live streams)
                const extinfTag = `#EXTINF:-1, ${channel}`;

                // Push EXTINF and the cleaned URL to the output
                output.push(extinfTag);
                output.push(cleanedUrl);

                includeNextUrl = false; // Reset flag after including the URL
            }
        }

        // If the channel is found, return the stream URL(s) with EXTINF
        if (output.length > 0) {
            res.setHeader('Content-Type', 'application/x-mpegURL');
            res.status(200).send('#EXTM3U\n' + output.join('\n') + '\n');
        } else {
            res.status(404).json({ error: `Channel "${channel}" not found` });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while processing the M3U file." });
    }
}
