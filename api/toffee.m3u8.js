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
                const fullLower = fullName.toLowerCase().trim();
                const normalized = fullLower.replace(/\s+(hd|sd|uhd|4k)\b/g, '').trim();

                if (urlLine.startsWith('http')) {
                    channels.push({
                        fullName,
                        fullLower,
                        normalized,
                        url: urlLine.split('|')[0]
                    });
                }
            }
        }

        const queryOriginal = channel.trim();
        const queryLower = queryOriginal.toLowerCase().trim();
        const queryNormalized = queryLower.replace(/\s+(hd|sd|uhd|4k)\b/g, '').trim();

        // DEBUG: Find all channels that include 'cartoon network'
        const debugHits = channels.filter(c => c.fullLower.includes('cartoon network'));
        console.log('DEBUG Possible matches for cartoon:', debugHits.map(c => c.fullName));

        let bestMatch = null;

        // 1. Exact full name match
        bestMatch = channels.find(c => c.fullLower === queryLower);

        // 2. Full name includes (e.g., partial but full name)
        if (!bestMatch) {
            const candidates = channels.filter(c => c.fullLower.includes(queryLower));
            if (candidates.length > 0) {
                bestMatch = candidates[0];
            }
        }

        // 3. Normalized match
        if (!bestMatch) {
            const normMatches = channels.filter(c => c.normalized === queryNormalized);
            if (normMatches.length > 0) {
                // Sort to prefer shorter names if multiple
                bestMatch = normMatches.sort((a, b) => a.fullName.length - b.fullName.length)[0];
            }
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
        console.error('Error during M3U parsing:', error);
        res.status(500).json({ error: "An error occurred while processing the M3U file." });
    }
}
