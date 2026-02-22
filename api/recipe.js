import Groq from 'groq-sdk';

console.log('API KEY EXISTS:', !!process.env.GROQ_API_KEY);
console.log('API KEY (first 20 chars):', process.env.GROQ_API_KEY?.slice(0, 20) || 'MISSING');

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.error('CRITICAL: GROQ_API_KEY is not set in environment variables!');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is not set');
    }

    const groq = new Groq({
      apiKey: apiKey,
    });

    const { budget, ingredients, surpriseMe } = req.body;

    const systemPrompt = `You are a JSON-only API. NEVER output markdown, code blocks (no backticks), or explanations.
Return ONLY raw JSON with exactly these fields:
- dishName: string (Danish recipe name)
- heroEmoji: one food emoji only
- funIntro: string (max 15 words, encouraging)
- ingredients: array of 5-7 objects with name, lidlProductName, price (number), onSale (boolean), checked (true)
- steps: array of 4-6 instruction strings
- totalCost: number (sum of prices)
- savings: number (approx 25% of sale items)

Use realistic Danish DKK prices. Include 2-3 sale items. Use fictional Lidl brands (Favorit, Pikok, Milbona, Combino, Fairglobe). Always healthy recipes. Stay under budget if given. Use provided ingredients where possible.`;

    let userPrompt = '';
    if (surpriseMe) {
      userPrompt = 'Surprise me with a healthy, budget-friendly recipe that would appeal to a young person trying to eat better!';
    } else {
      const parts = [];
      if (budget) parts.push(`I have a budget of ${budget} DKK`);
      if (ingredients && ingredients.length > 0) parts.push(`I have these ingredients: ${ingredients.join(', ')}`);
      userPrompt = parts.length > 0 ? parts.join('. ') : 'Create a healthy recipe for me';
    }

    console.log('Calling Groq API with:', { budget, ingredientsCount: ingredients?.length || 0, surpriseMe });

    const message = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    console.log('Groq response received:', { stopReason: message.choices[0]?.finish_reason, contentType: 'text' });

    let content = message.choices[0].message?.content || '';
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    console.log('Parsing recipe JSON...');
    const recipe = JSON.parse(content);

    console.log('Recipe parsed successfully:', { dishName: recipe.dishName, ingredientCount: recipe.ingredients?.length });

    return res.status(200).json(recipe);
  } catch (error) {
    console.error('FULL ERROR OBJECT:', error);
    console.error('Error message:', error?.message);
    console.error('Error status:', error?.status);
    console.error('Error response:', error?.response);
    console.error('Error code:', error?.code);

    return res.status(500).json({
      error: 'Oops, our chef is taking a break! 🍳 Try again.',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
    });
  }
}
