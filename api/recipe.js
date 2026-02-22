import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY;

const FALLBACK_EMOJI = "🍽️";
const DISH_EMOJIS = ["🍝","🥗","🍲","🥘","🍛","🥙","🫕","🍜","🥚","🫔"];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const groq = new Groq({ apiKey });
    const { budget, ingredients, surpriseMe } = req.body;

    const systemPrompt = `You are a JSON-only API. Return ONLY a valid JSON object, no markdown, no backticks, no explanations.
Do NOT include any emoji characters anywhere in your response - use plain text only.

Return exactly these fields:
- dishName: string (Danish recipe name, plain text only)
- funIntro: string (max 15 words, encouraging, plain text only)
- ingredients: array of 5-7 objects each with: name (string), lidlProductName (string), price (number), onSale (boolean), checked (true)
- steps: array of 4-6 instruction strings (plain text only)
- totalCost: number (sum of all ingredient prices)
- savings: number (sum of 25% of onSale item prices)

Use realistic Danish DKK prices. Make 2-3 ingredients onSale true. Use Lidl brand names like Favorit, Pikok, Milbona, Combino, Fairglobe. Always healthy. Stay under budget if given.`;

    let userPrompt = '';
    if (surpriseMe) {
      userPrompt = 'Surprise me with a healthy budget-friendly recipe for a young person!';
    } else {
      const parts = [];
      if (budget) parts.push(`Budget: ${budget} DKK`);
      if (ingredients?.length > 0) parts.push(`Ingredients I have: ${ingredients.join(', ')}`);
      userPrompt = parts.length > 0 ? parts.join('. ') : 'Create a healthy recipe for me';
    }

    const message = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    let content = message.choices[0].message?.content || '';

    // Strip any markdown
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Remove any emoji characters that sneak in
    content = content.replace(/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]/gu, '');

    const recipe = JSON.parse(content);

    // Add emoji in our code, not from AI
    recipe.heroEmoji = DISH_EMOJIS[Math.floor(Math.random() * DISH_EMOJIS.length)];

    return res.status(200).json(recipe);

  } catch (error) {
    console.error('Error:', error?.message);
    return res.status(500).json({
      error: 'Oops, our chef is taking a break! 🍳 Try again.',
    });
  }
}
