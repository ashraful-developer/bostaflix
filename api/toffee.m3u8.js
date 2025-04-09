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
                const nameLine = lines[i];
                const urlLine = lines[i + 1];

                const fullName = nameLine.replace('#EXTINF:-1,', '').trim();
                const normalized = fullName.toLowerCase().replace(/\s+(hd|sd|uhd|4k)\b/g, '').trim();

                if (urlLine.startsWith('http')) {
                    channels.push({
                        fullName,
                        normalized,
                        url: urlLine.split('|')[0]
                    });
                }
            }
        }

        const queryNormalized = channel.toLowerCase().trim();

        // Prioritize exact normalized match, then includes, then fallback
        const exactMatches = channels.filter(c => c.normalized === queryNormalized);
        const partialMatches = channels.filter(c => c.normalized.includes(queryNormalized));

        let bestMatch = null;

        if (exactMatches.length > 0) {
            // Among exact matches, prefer shortest original name (likely non-HD)
            bestMatch = exactMatches.sort((a, b) => a.fullName.length - b.fullName.length)[0];
        } else if (partialMatches.length > 0) {
            bestMatch = partialMatches.sort((a, b) => a.fullName.length - b.fullName.length)[0];
        }

        if (bestMatch) {
            const streamUrl = bestMatch.url.replace(
                'https://tv.bdixtv24.co/',
                'https://bostaflix-tvcdn.global.ssl.fastly.net/'
            );

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
