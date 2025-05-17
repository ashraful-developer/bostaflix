const https = require('https');

module.exports = (req, res) => {
  const { text } = req.query;

  if (!text) {
    res.status(400).json({ error: 'Missing `text` query parameter' });
    return;
  }

  const apiKey = 'AIzaSyDTcXqcX1EnO194fj49RkF0k14vq6Mc_TE'; // Replace with your actual API key
  const data = JSON.stringify({
    contents: [
      {
        parts: [
          { text }
        ]
      }
    ]
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
    let responseData = '';

    apiRes.on('data', chunk => {
      responseData += chunk;
    });

    apiRes.on('end', () => {
      try {
        const result = JSON.parse(responseData);
        res.status(200).json(result);
      } catch (err) {
        res.status(500).json({ error: 'Failed to parse API response', details: err.message });
      }
    });
  });

  apiReq.on('error', error => {
    res.status(500).json({ error: 'Request failed', details: error.message });
  });

  apiReq.write(data);
  apiReq.end();
};
