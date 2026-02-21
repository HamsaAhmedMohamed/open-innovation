# MyLidlChef

A mobile-first web app for Lidl+ targeting young people who want to cook healthier on a budget. Built with React, Tailwind CSS, and Groq AI.

## Features

- **Budget-Based Recipes** - Set your budget (20-300 DKK) to find recipes within your price range
- **Ingredient Input** - Add ingredients you already have to find matching recipes
- **Surprise Me** - Let the AI pick a random healthy recipe for you
- **AI-Powered** - Uses Groq's Llama 3.3 to generate unique recipes every time
- **Shopping List Integration** - Add ingredients to your Lidl Shopping List
- **Real Lidl Pricing** - Realistic Danish DKK prices and fictional Lidl product names
- **Savings Tracking** - Shows how much you save with daily deals

## Setup

### 1. Clone the repository
```bash
git clone <repo-url>
cd mylidlchef
```

### 2. Install dependencies
```bash
npm install
```

### 3. Get a Groq API key
1. Sign up at [console.groq.com](https://console.groq.com)
2. Create an API key in your account settings
3. Copy your API key

### 4. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` and add your Groq API key:
```
GROQ_API_KEY=your_key_here
```

### 5. For local development with serverless functions

Install Vercel CLI:
```bash
npm install -g vercel
```

Run the development server with serverless function support:
```bash
vercel dev
```

The app will be available at `http://localhost:3000`

### 6. Build for production
```bash
npm run build
```

## Deployment

### Deploy to Vercel

The easiest way to deploy is with Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add the `GROQ_API_KEY` environment variable in Vercel project settings
4. Vercel will automatically detect and build the project

## Design

- **Mobile-First**: 390px max-width with phone frame shadow
- **Lidl Branding**: Official brand colors and typography (Nunito & DM Sans)
- **Animations**: Smooth transitions, staggered reveals, and micro-interactions
- **Accessibility**: Proper contrast ratios and semantic HTML

## Tech Stack

- **Frontend**: React 18 + Tailwind CSS
- **Backend**: Vercel Serverless Functions (Node.js)
- **AI**: Groq API (Llama 3.3 70B)
- **Build**: Vite
- **Fonts**: Google Fonts (Nunito, DM Sans)

## API

### POST `/api/recipe`

Generates a recipe based on provided criteria.

**Request:**
```json
{
  "budget": 75,
  "ingredients": ["eggs", "spinach"],
  "surpriseMe": false
}
```

All fields are optional. Leave budget/ingredients empty for Surprise Me mode.

**Response:**
```json
{
  "dishName": "Spinach Omelette",
  "heroEmoji": "🍳",
  "funIntro": "Quick, healthy, and delicious!",
  "ingredients": [
    {
      "name": "Eggs 6-pack",
      "lidlProductName": "Lidl Favorit Eggs",
      "price": 12.95,
      "onSale": true,
      "checked": true
    }
  ],
  "steps": ["Step 1...", "Step 2..."],
  "totalCost": 67.5,
  "savings": 15.0
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT