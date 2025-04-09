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
                const name = lines[i];
                const url = lines[i + 1];

                channels.push({
                    name: name,
                    cleanName: name.replace('#EXTINF:-1,', '').trim().toLowerCase(),
                    url: url.startsWith('http') ? url.split('|')[0] : null
                });
            }
        }

        const query = channel.toLowerCase();

        // Simple match ranking: exact match > startsWith > includes
        const ranked = channels
            .filter(c => c.url)
            .map(c => {
                let score = 0;
                if (c.cleanName === query) score = 3;
                else if (c.cleanName.startsWith(query)) score = 2;
                else if (c.cleanName.includes(query)) score = 1;
                return { ...c, score };
            })
            .filter(c => c.score > 0)
            .sort((a, b) => b.score - a.score);

        if (ranked.length > 0) {
            let streamUrl = ranked[0].url.replace(
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
