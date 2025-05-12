export default async function handler(req, res) {
  try {
    const apiResponse = await fetch('https://api.aimlapi.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AIML_API_KEY}`, // set this in Vercel env vars
      },
      body: JSON.stringify({
        model: 'deepseek-reasoner',
        messages: [
          {
            role: 'user',
            content: '', // or req.body.content if you take user input
          },
        ],
        temperature: 0.7,
        top_p: 0.7,
        frequency_penalty: 1,
        max_output_tokens: 512,
        top_k: 50,
      }),
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error('API error:', data);
      return res.status(apiResponse.status).json({ error: data });
    }

    const message = data.choices?.[0]?.message?.content || 'No response';
    res.status(200).json({ assistant: message });
  } catch (error) {
    console.error('Request failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
