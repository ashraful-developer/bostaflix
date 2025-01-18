// Set the content type to indicate an M3U8 file
const headers = new Headers();
headers.append('Content-Type', 'application/vnd.apple.mpegurl');

// Validate and retrieve the GMT parameter from the URL
const urlParams = new URLSearchParams(window.location.search);
const gmtParam = urlParams.get('gmt');

if (!gmtParam || isNaN(gmtParam)) {
    // Bad Request
    console.error("Invalid or missing 'gmt' parameter.");
    throw new Error("Invalid or missing 'gmt' parameter.");
}

const gmtOffset = parseInt(gmtParam); // GMT offset in hours

// Convert the GMT offset to seconds
const currentUtcTime = Math.floor(Date.now() / 1000);
const gmtInSeconds = currentUtcTime + (gmtOffset * 3600);

// Define the base URL for the segments
const baseUrl = "https://mtv.sunplex.live/MAASRANGA-TV/tracks-v1a1";

// Calculate the timestamp for the program date
const programDateTime = new Date(gmtInSeconds * 1000).toISOString();

// Define the number of segments and their duration
const segmentsCount = 4;
const segmentDuration = 1.200; // seconds

// Start generating the M3U8 content
let m3u8Content = "#EXTM3U\n";
m3u8Content += "#EXT-X-TARGETDURATION:2\n";
m3u8Content += "#EXT-X-VERSION:3\n";
m3u8Content += "#EXT-X-MEDIA-SEQUENCE:" + Math.floor(gmtInSeconds / segmentDuration) + "\n";
m3u8Content += "#EXT-X-PROGRAM-DATE-TIME:" + programDateTime + "\n";

// Generate the segments
for (let i = 0; i < segmentsCount; i++) {
    const segmentTime = new Date((gmtInSeconds + i * segmentDuration) * 1000).toISOString().replace(/T/, '/').replace(/:/g, '/').split('.')[0];
    m3u8Content += "#EXTINF:" + segmentDuration + ",\n";
    m3u8Content += `${baseUrl}/${segmentTime}-01200.ts\n`;
}

// Output the M3U8 content
console.log(m3u8Content);

