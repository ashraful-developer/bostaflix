export default async function handler(req, res) {
    const { channel } = req.query;

    if (!channel) {
        return res.status(400).json({ error: "Channel parameter is required" });
    }
    
    try {
        // URL of your M3U playlist
        const m3uUrl = 'https://noobmaster.xyz/apis/aynaott/playlist.m3u';

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
                continue;
            }

            // If we should include the next URL (the stream URL)
            if (includeNextUrl && line.startsWith('http')) {
                streamUrl = line.split('|')[0]; // Remove everything after the pipe symbol (if present)

                // Replace origin in the final m3u8 URL
                streamUrl = streamUrl
                    .replace('https://tvs1.aynaott.com/', 'https://ayna-bosta.global.ssl.fastly.net/')
                    .replace('https://tvs2.aynaott.com/', 'https://ayna2-bosta.global.ssl.fastly.net/')
                    .replace('https://tvs3.aynaott.com/', 'https://ayna3-bosta.global.ssl.fastly.net/');
                
                break;
            }
        }

        // If the channel is found, redirect to the stream URL
        if (streamUrl) {
            res.writeHead(302, { Location: streamUrl });
            res.end();
        } else {
            res.status(404).json({ error: `Channel "${channel}" not found` });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while processing the M3U file." });
    }
}
