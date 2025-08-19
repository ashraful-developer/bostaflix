const https = require('https');
const { TextDecoder } = require('util');

module.exports = (req, res) => {
  const { text } = req.query;

  if (!text) {
    res.status(400).json({ error: 'Missing `text` query parameter' });
    return;
  }

  const apiKey = 'AIzaSyDTcXqcX1EnO194fj49RkF0k14vq6Mc_TE';
  const data = JSON.stringify({
    contents: [{ parts: [{ text }] }]
  });

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const apiReq = https.request(options, apiRes => {
    const decoder = new TextDecoder('utf-8', { fatal: false });
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    res.write('{"chunks":['); // start JSON array

    let firstChunk = true;

    apiRes.on('data', chunk => {
      const textChunk = decoder.decode(chunk, { stream: true });

      // wrap chunks in quotes and separate with comma
      if (!firstChunk) res.write(',');
      res.write(JSON.stringify(textChunk));
      firstChunk = false;
    });

    apiRes.on('end', () => {
      const lastChunk = decoder.decode(); // flush remaining
      if (lastChunk) res.write(',' + JSON.stringify(lastChunk));
      res.write(']}'); // close JSON array
      res.end();
    });
  });

  apiReq.on('error', err => {
    res.status(500).json({ error: 'Request failed', details: err.message });
  });

  apiReq.write(data);
  apiReq.end();
};
