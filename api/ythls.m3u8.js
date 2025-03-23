import { IncomingMessage } from "http";
import { request } from "https";

export default async function handler(req, res) {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: "Missing ID parameter" });
    }

    const url = `https://corsproxy.io/?https://inv.nadeko.net/watch?v=${id}`;
    
    try {
        const html = await fetchHtml(url);
        if (!html) {
            return res.status(500).json({ error: "Failed to fetch the page" });
        }
        
        const streamUrl = extractM3U8Url(html);
        if (!streamUrl) {
            return res.status(404).json({ error: "Stream URL not found" });
        }
        
        let finalUrl = streamUrl.startsWith("/") ? `https://inv.nadeko.net${streamUrl}` : streamUrl;
        finalUrl += "&local=true";
        
        return res.json({ streamUrl: finalUrl });
    } catch (error) {
        return res.status(500).json({ error: error.message || "Unexpected server error" });
    }
}

function fetchHtml(url) {
    return new Promise((resolve, reject) => {
        const req = request(url, {
            headers: {
                "authority": "inv.nadeko.net",
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-encoding": "gzip, deflate, br, zstd",
                "accept-language": "en-US,en;q=0.9,bn;q=0.8",
                "cache-control": "max-age=0",
                "cookie": "PREFS=%7B%22volume%22%3A100%2C%22speed%22%3A1%7D; INVIDIOUS_SERVER_ID=2",
                "dnt": "1",
                "priority": "u=0, i",
                "referer": "https://inv.nadeko.net/",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "same-origin",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            },
            timeout: 5000 // 5 seconds timeout
        }, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP error: ${res.statusCode}`));
                return;
            }
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => resolve(data));
        });
        req.on("error", (err) => reject(new Error("Network error: " + err.message)));
        req.on("timeout", () => {
            req.destroy();
            reject(new Error("Request timeout"));
        });
        req.end();
    });
}

function extractM3U8Url(html) {
    const match = html.match(/https?:[^"']+\.m3u8/);
    return match ? match[0] : null;
}
