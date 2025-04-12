export default async function handler(req, res) {
    const { channel } = req.query;

    if (!channel) {
        return res.status(400).json({ error: "Channel parameter is required" });
    }

    try {
        const m3uUrl = 'https://host.mafiatv.live/toffee/kaya_app.php?route=getIPTVList';
        const response = await fetch(m3uUrl);
        if (!response.ok) {
            return res.status(500).json({ error: "Failed to fetch the M3U playlist." });
        }

        const m3uContent = await response.text();
        const lines = m3uContent.split('\n').map(line => line.trim()).filter(line => line !== '');

        const channels = [];

        for (let i = 0; i < lines.length - 1; i++) {
            if (lines[i].startsWith('#EXTINF')) {
                const fullName = lines[i].split(',').pop().trim();
                const urlLine = lines[i + 1];

                if (urlLine.startsWith('http')) {
                    const idMatch = urlLine.match(/id=([^&|]+)/);
                    const id = idMatch ? idMatch[1] : null;

                    if (id) {
                        channels.push({
                            id,
                            fullName,
                            fullLower: fullName.toLowerCase()
                        });
                    }
                }
            }
        }

        const queryLower = channel.trim().toLowerCase();

        // Try exact match first
        const exactMatch = channels.find(c => c.fullLower === queryLower);

        // Fallback to partial match
        const match = exactMatch || channels.find(c => c.fullLower.includes(queryLower));

        if (match) {
            const redirectUrl = `https://stream-engine-bostaflix.global.ssl.fastly.net/toffee/MaFiAlive.php?id=${match.id}`;
            res.writeHead(302, { Location: redirectUrl });
            return res.end();
        }

        return res.status(404).json({ error: `Channel "${channel}" not found` });

    } catch (error) {
        console.error('Error during M3U parsing:', error);
        return res.status(500).json({ error: "An error occurred while processing the M3U file." });
    }
}
