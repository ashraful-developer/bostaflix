export default async function handler(req, res) {
    const { channel } = req.query;

    if (!channel) {
        return res.status(400).json({ error: "Channel parameter is required" });
    }

    try {
        const m3uUrl = 'https://bostaflix-tvcdn.global.ssl.fastly.net/toffee/rriptv_app.php?route=getIPTVList';
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
                    channels.push({
                        fullName,
                        fullLower: fullName.toLowerCase(),
                        url: urlLine.split('|')[0]
                    });
                }
            }
        }

        const queryOriginal = channel.trim();
        const queryLower = queryOriginal.toLowerCase();

        // 1. Strict exact match (case-insensitive)
        const exactMatch = channels.find(c => c.fullLower === queryLower);

        if (exactMatch) {
            const streamUrl = exactMatch.url.replace(
                'https://tv.bdixtv24.co/',
                'https://bostaflix-tvcdn.global.ssl.fastly.net/'
            );
            res.writeHead(302, { Location: streamUrl });
            return res.end();
        }

        // 2. Fallback: partial includes match
        const includesMatch = channels.find(c => c.fullLower.includes(queryLower));
        if (includesMatch) {
            const streamUrl = includesMatch.url.replace(
                'https://tv.bdixtv24.co/',
                'https://bostaflix-tvcdn.global.ssl.fastly.net/'
            );
            res.writeHead(302, { Location: streamUrl });
            return res.end();
        }

        res.status(404).json({ error: `Channel "${channel}" not found` });

    } catch (error) {
        console.error('Error during M3U parsing:', error);
        res.status(500).json({ error: "An error occurred while processing the M3U file." });
    }
}
