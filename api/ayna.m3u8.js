import http from 'http';
import https from 'https';
import { parse } from 'url';

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: "id parameter is required" });
    }

    try {
        const m3uResponse = await fetch('https://aynaxpranto.vercel.app/files/playlist.m3u');
        if (!m3uResponse.ok) {
            return res.status(500).json({ error: "Failed to fetch M3U playlist." });
        }

        const m3uContent = await m3uResponse.text();
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
                streamUrl = line.split('|')[0];
                break;
            }
        }

        if (!streamUrl) {
            return res.status(404).json({ error: `id "${id}" not found` });
        }

        const streamUrlParsed = parse(streamUrl);
        const client = streamUrlParsed.protocol === 'https:' ? https : http;

        const options = {
            method: 'GET',
            hostname: streamUrlParsed.hostname,
            path: streamUrlParsed.path,
            headers: {
                'User-Agent': req.headers['user-agent'] || 'Node.js Proxy',
            }
        };

        const proxyReq = client.request(options, (proxyRes) => {
            if ([301, 302].includes(proxyRes.statusCode)) {
                const location = proxyRes.headers.location;
                if (location) {
                    res.writeHead(proxyRes.statusCode, { Location: location });
                    res.end();
                    return;
                }
            }

            // Set headers from the response
            res.writeHead(proxyRes.statusCode, {
                'Content-Type': proxyRes.headers['content-type'] || 'application/octet-stream',
                'Cache-Control': 'no-cache',
            });

            // Pipe the stream
            proxyRes.pipe(res);
        });

        proxyReq.on('error', (err) => {
            console.error(err);
            res.status(500).json({ error: 'Error fetching the stream.' });
        });

        proxyReq.end();

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred during processing.' });
    }
}
