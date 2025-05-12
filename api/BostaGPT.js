export default async function handler(req, res) {
  const userMessage = req.query.text || ''; // Get the user message from query param

  if (!userMessage.trim()) {
    return res.status(400).json({ error: 'Missing ?text= query parameter' });
  }

  try {
    // The fetch API to make the request to OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer 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`, // Correct way to pass the API key in the Authorization header
        'HTTP-Referer': 'https://bostaflix.vercel.app',  // Optional: replace with your actual site URL
        'X-Title': 'Bostaflix',      // Optional: replace with your site title
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages: [
          {
            role: 'user',
            content: userMessage,  // User message from the query parameter
          },
        ],
      }),
    });

    const data = await response.json();

    // Check if the response is successful
    if (!response.ok) {
      console.error('API error:', data);
      return res.status(response.status).json({ error: data });
    }

    // Extract message from the response
    const message = data.choices?.[0]?.message?.content || 'No response';

    // Send the response back to the user
    res.status(200).json({ assistant: message });
  } catch (error) {
    console.error('Request failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
