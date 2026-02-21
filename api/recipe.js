import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { budget, ingredients, surpriseMe } = req.body;

    const systemPrompt = `You are MyLidlChef, a fun cooking assistant for the Lidl+ app in Denmark.
Given a budget (DKK), available ingredients, or a surprise request, return ONLY raw JSON — no markdown, no explanation.

Return this structure:
{
  "dishName": "string",
  "heroEmoji": "one food emoji",
  "funIntro": "one fun encouraging sentence, max 15 words",
  "ingredients": [
    {
      "name": "ingredient + quantity e.g. 'Pasta 500g'",
      "lidlProductName": "fictional Lidl brand name — use prefixes like Lidl Favorit, Pikok, Milbona, Combino, Fairglobe",
      "price": number in DKK,
      "onSale": boolean,
      "checked": true
    }
  ],
  "steps": ["step 1", "step 2", ...],
  "totalCost": number,
  "savings": number
}

Rules: 5–7 ingredients, 2–3 onSale. Realistic Danish DKK prices. totalCost = sum of prices. savings = total discount from sale items (~25% off). 4–6 beginner-friendly steps. Stay under budget if given. Use provided ingredients where possible. Always healthy.`;

    let userPrompt = '';
    if (surpriseMe) {
      userPrompt = 'Surprise me with a healthy, budget-friendly recipe that would appeal to a young person trying to eat better!';
    } else {
      const parts = [];
      if (budget) parts.push(`I have a budget of ${budget} DKK`);
      if (ingredients && ingredients.length > 0) parts.push(`I have these ingredients: ${ingredients.join(', ')}`);
      userPrompt = parts.length > 0 ? parts.join('. ') : 'Create a healthy recipe for me';
    }

    const message = await groq.messages.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '';
    const recipe = JSON.parse(content);

    return res.status(200).json(recipe);
  } catch (error) {
    console.error('Error calling Groq API:', error);
    return res.status(500).json({
      error: 'Oops, our chef is taking a break! 🍳 Try again.',
    });
  }
}
