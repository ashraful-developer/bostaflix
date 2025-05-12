import { OpenAI } from 'openai';

const api = new OpenAI({
  baseURL: 'https://api.aimlapi.com/v1',
  apiKey: `Bearer a941695a8b7549f4b2aa6cc4e178849b`,
});

export default async function handler(req, res) {
  try {
    const result = await api.chat.completions.create({
      model: 'deepseek-reasoner',
      messages: [
        {
          role: 'user',
          content: '',
        },
      ],
      temperature: 0.7,
      top_p: 0.7,
      frequency_penalty: 1,
      top_k: 50,
    });

    const message = result.choices[0].message.content;
    res.status(200).json({ assistant: message });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
}
