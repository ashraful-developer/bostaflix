export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: "id parameter is required" });
    }

    try {
        // URL of your M3U playlist
        const m3uUrl = 'https://aynaxpranto.vercel.app/files/playlist.m3u';

        // Fetch the M3U file content
        const response = await fetch(m3uUrl);
        if (!response.ok) {
            return res.status(500).json({ error: "Failed to fetch the M3U playlist." });
        }

        const m3uContent = await response.text();

        // Split and parse M3U
        const lines = m3uContent.split('\n').map(line => line.trim()).filter(line => line !== '');

        let streamUrl = null;
        let includeNextUrl = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes(id)) {
                includeNextUrl = true;
                continue;
            }
            if (includeNextUrl && line.startsWith('http')) {
                streamUrl = line.split('|')[0]; // Clean URL if needed
                break;
            }
        }

        if (!streamUrl) {
            return res.status(404).json({ error: `id "${id}" not found` });
        }

        // Proxy the stream
        const streamResponse = await fetch(streamUrl);

        if (!streamResponse.ok) {
            return res.status(500).json({ error: "Failed to fetch the stream." });
        }

        // Copy headers to client
        res.setHeader('Content-Type', streamResponse.headers.get('content-type') || 'application/octet-stream');
        streamResponse.body.pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while processing the stream." });
    }
}
