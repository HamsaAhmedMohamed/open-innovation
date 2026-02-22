import { useState, useEffect } from 'react';

const LIDL_COLORS = {
  blue: '#0050AA',
  yellow: '#FFD700',
  red: '#E60A14',
  white: '#FFFFFF',
  lightGray: '#F4F4F4',
};

const FUN_FACTS = [
  "Did you know? Lentils have more protein per gram than steak! 💪",
  "Did you know? Cooking at home saves you up to 70% compared to eating out! 🏠",
  "Did you know? Frozen veggies are just as nutritious as fresh ones! ❄️",
  "Did you know? Meal prepping can save you 5+ hours per week! ⏰",
  "Did you know? Spices can boost your metabolism naturally! 🌶️"
];

function FloatingEmoji({ emoji, delay, duration = 800 }) {
  const left = Math.random() * 100;
  return (
    <div
      className="float-up-fade absolute text-xl pointer-events-none"
      style={{
        left: `${left}%`,
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
      }}
    >
      {emoji}
    </div>
  );
}

function App() {
  const [screen, setScreen] = useState('input');
  const [budgetEnabled, setBudgetEnabled] = useState(false);
  const [budget, setBudget] = useState(75);
  const [ingredients, setIngredients] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [recipe, setRecipe] = useState(null);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [floatingEmojis, setFloatingEmojis] = useState([]);

  const handleAddIngredient = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = inputValue.trim().replace(',', '');
      if (value && !ingredients.includes(value)) {
        setIngredients([...ingredients, value]);
        setInputValue('');
      }
    }
  };

  const handleRemoveIngredient = (ingredient) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  const callRecipeAPI = async (budgetVal, ingredientsList, isSurpriseMe) => {
    try {
      setError(null);
      setLoading(true);
      setScreen('loading');

      let factTimer = setInterval(() => {
        setFactIndex(prev => (prev + 1) % FUN_FACTS.length);
      }, 800);

      console.log('Frontend: Calling /api/recipe with:', { budgetVal, ingredientsCount: ingredientsList?.length, isSurpriseMe });

      const response = await fetch('/api/recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget: budgetVal,
          ingredients: ingredientsList,
          surpriseMe: isSurpriseMe,
        }),
      });

      console.log('Frontend: Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Frontend: API error response:', errorData);
        throw new Error(`API returned ${response.status}: ${errorData.error}`);
      }

      const data = await response.json();
      console.log('Frontend: Recipe received:', { dishName: data.dishName, ingredientCount: data.ingredients?.length });

      setRecipe(data);
      setSelectedIngredients(data.ingredients.map((_, i) => i));

      setTimeout(() => {
        clearInterval(factTimer);
        setLoading(false);
        setScreen('result');
      }, 2500);
    } catch (err) {
      clearInterval();
      console.error('Frontend: FULL ERROR:', err);
      console.error('Frontend: Error message:', err?.message);
      console.error('Frontend: Error stack:', err?.stack);
      setError('Oops, our chef is taking a break! 🍳 Try again.');
      setLoading(false);
      setScreen('input');
    }
  };

  const handleFindRecipe = () => {
    callRecipeAPI(budgetEnabled ? budget : null, ingredients, false);
  };

  const handleSurpriseMe = () => {
    setIsSpinning(true);
    setTimeout(() => {
      setIsSpinning(false);
      callRecipeAPI(null, [], true);
    }, 800);
  };

  const handleAddToList = () => {
    setFloatingEmojis([
      { id: 1, emoji: '🎉', delay: 0 },
      { id: 2, emoji: '✨', delay: 100 },
      { id: 3, emoji: '🎉', delay: 200 },
      { id: 4, emoji: '✨', delay: 300 },
    ]);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
    setTimeout(() => setFloatingEmojis([]), 800);
  };

  const handleBack = () => {
    setScreen('input');
    setBudgetEnabled(false);
    setBudget(75);
    setIngredients([]);
    setInputValue('');
    setRecipe(null);
    setSelectedIngredients([]);
    setError(null);
  };

  const toggleIngredient = (index) => {
    setSelectedIngredients(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const canSubmit = budgetEnabled || ingredients.length > 0;

  return (
    <div className="min-h-screen py-8 px-4">
      <div
        className="max-w-[390px] mx-auto bg-white rounded-[32px] overflow-hidden shadow-2xl"
        style={{ minHeight: '844px' }}
      >
        {/* Header */}
        <div
          className="px-6 py-5"
          style={{ backgroundColor: LIDL_COLORS.blue }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">👨‍🍳</span>
            <h1 className="font-nunito font-bold text-white text-2xl">MyLidlChef</h1>
          </div>
          <p className="text-white/90 text-sm font-dm-sans">Cook smart. Eat well. Save more.</p>
        </div>

        {/* INPUT SCREEN */}
        {screen === 'input' && (
          <div className="p-6 space-y-4 slide-up">
            {error && (
              <div
                className="p-4 rounded-xl text-center font-dm-sans font-semibold"
                style={{ backgroundColor: '#fee', color: LIDL_COLORS.red }}
              >
                {error}
              </div>
            )}

            {/* Budget Card */}
            <div
              className="rounded-2xl p-6 transition-all duration-300"
              style={{ backgroundColor: LIDL_COLORS.lightGray }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  <span className="font-nunito font-semibold text-lg">I have a budget</span>
                </div>
                <button
                  onClick={() => setBudgetEnabled(!budgetEnabled)}
                  className="relative w-12 h-6 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: budgetEnabled ? LIDL_COLORS.blue : '#ccc'
                  }}
                >
                  <div
                    className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-md"
                    style={{ left: budgetEnabled ? '26px' : '2px' }}
                  />
                </button>
              </div>

              {budgetEnabled && (
                <div className="mt-4 fade-in">
                  <div
                    className="inline-block px-4 py-2 rounded-full font-nunito font-bold text-2xl mb-4"
                    style={{ backgroundColor: LIDL_COLORS.yellow, color: LIDL_COLORS.blue }}
                  >
                    {budget} DKK
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="300"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, ${LIDL_COLORS.blue} 0%, ${LIDL_COLORS.blue} ${((budget - 20) / 280) * 100}%, #ddd ${((budget - 20) / 280) * 100}%, #ddd 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>20 DKK</span>
                    <span>300 DKK</span>
                  </div>
                </div>
              )}
            </div>

            {/* Ingredients Card */}
            <div
              className="rounded-2xl p-6"
              style={{ backgroundColor: LIDL_COLORS.lightGray }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🥦</span>
                <span className="font-nunito font-semibold text-lg">I have ingredients</span>
              </div>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleAddIngredient}
                placeholder="e.g. chicken, pasta, tomatoes..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none transition-colors"
              />
              {ingredients.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {ingredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="px-3 py-1.5 rounded-full text-white text-sm font-medium flex items-center gap-2 fade-in"
                      style={{ backgroundColor: LIDL_COLORS.blue }}
                    >
                      {ingredient}
                      <button
                        onClick={() => handleRemoveIngredient(ingredient)}
                        className="hover:scale-110 transition-transform"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Find Recipe Button */}
            <button
              onClick={handleFindRecipe}
              disabled={!canSubmit || loading}
              className="w-full py-4 rounded-2xl font-nunito font-bold text-lg text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: canSubmit && !loading ? LIDL_COLORS.blue : '#ccc'
              }}
            >
              {loading ? 'Loading...' : 'Find My Recipe →'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-gray-400 text-sm font-semibold">OR</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Surprise Me Button */}
            <button
              onClick={handleSurpriseMe}
              disabled={loading}
              className="w-full py-5 rounded-2xl font-nunito font-bold text-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: LIDL_COLORS.yellow,
                color: LIDL_COLORS.blue
              }}
            >
              <span className={isSpinning ? 'spin-dice inline-block' : 'inline-block'}>🎲</span> {loading ? 'Loading...' : 'Surprise Me!'}
            </button>
          </div>
        )}

        {/* LOADING SCREEN */}
        {screen === 'loading' && (
          <div className="p-6 space-y-4">
            <div className="shimmer rounded-2xl h-48"></div>
            <div className="shimmer rounded-xl h-8 w-3/4"></div>
            <div className="space-y-2">
              <div className="shimmer rounded-lg h-12"></div>
              <div className="shimmer rounded-lg h-12"></div>
              <div className="shimmer rounded-lg h-12"></div>
              <div className="shimmer rounded-lg h-12"></div>
            </div>
            <div className="shimmer rounded-xl h-32"></div>

            <div
              className="mt-8 p-4 rounded-xl text-center fade-in"
              style={{ backgroundColor: LIDL_COLORS.yellow }}
            >
              <p className="font-dm-sans text-sm" style={{ color: LIDL_COLORS.blue }}>
                {FUN_FACTS[factIndex]}
              </p>
            </div>
          </div>
        )}

        {/* RESULT SCREEN */}
        {screen === 'result' && recipe && (
          <div className="p-6 space-y-5 slide-up">
            {/* Dish Name & Emoji */}
            <div className="text-center stagger-1 slide-up">
              <div
                className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-5xl"
                style={{ backgroundColor: LIDL_COLORS.yellow }}
              >
                {recipe.heroEmoji}
              </div>
              <h2
                className="font-nunito font-bold text-2xl"
                style={{ color: LIDL_COLORS.blue }}
              >
                {recipe.dishName}
              </h2>
              <p className="text-gray-600 text-sm mt-1">{recipe.funIntro}</p>
            </div>

            {/* Ingredient List */}
            <div className="stagger-2 slide-up">
              <h3 className="font-nunito font-bold text-lg mb-3" style={{ color: LIDL_COLORS.blue }}>
                🛒 Ingredients
              </h3>
              <div className="space-y-2">
                {recipe.ingredients.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl border-2 transition-all duration-200 ingredient-row"
                    style={{
                      backgroundColor: LIDL_COLORS.lightGray,
                      borderColor: selectedIngredients.includes(index) ? LIDL_COLORS.blue : 'transparent'
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIngredients.includes(index)}
                        onChange={() => toggleIngredient(index)}
                        className="mt-1 w-5 h-5 cursor-pointer accent-blue-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-dm-sans font-semibold">{item.name}</p>
                            <p className="text-xs text-gray-500 italic">{item.lidlProductName}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-dm-sans font-bold">{item.price.toFixed(2)} DKK</p>
                            {item.onSale && (
                              <span
                                className="inline-block text-[10px] font-bold px-2 py-0.5 rounded text-white mt-1"
                                style={{ backgroundColor: LIDL_COLORS.red }}
                              >
                                🔥 TILBUD
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add to List Button */}
            <div className="stagger-3 slide-up relative">
              {floatingEmojis.length > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                  {floatingEmojis.map(item => (
                    <FloatingEmoji key={item.id} emoji={item.emoji} delay={item.delay} />
                  ))}
                </div>
              )}
              <button
                onClick={handleAddToList}
                className="w-full py-4 rounded-2xl font-nunito font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: LIDL_COLORS.blue }}
              >
                🛒 Add selected to Lidl Shopping List
              </button>
            </div>

            {/* Savings Banner - Full Bleed */}
            <div
              className="stagger-3 slide-up -mx-6 px-6 py-4 text-center shadow-md"
              style={{ backgroundColor: LIDL_COLORS.yellow }}
            >
              <p className="font-nunito font-bold text-lg" style={{ color: LIDL_COLORS.blue }}>
                🎉 You save {recipe.savings.toFixed(2)} DKK with today's deals!
              </p>
            </div>

            {/* Steps */}
            <div className="stagger-4 slide-up">
              <h3 className="font-nunito font-bold text-lg mb-3" style={{ color: LIDL_COLORS.blue }}>
                👨‍🍳 Step-by-Step Instructions
              </h3>
              <div className="space-y-3">
                {recipe.steps.map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-nunito font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: LIDL_COLORS.blue }}
                    >
                      {index + 1}
                    </div>
                    <p className="font-dm-sans text-gray-700 pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Cost */}
            <div
              className="stagger-5 slide-up p-4 rounded-2xl"
              style={{ backgroundColor: LIDL_COLORS.lightGray }}
            >
              <p className="font-nunito font-bold text-xl" style={{ color: LIDL_COLORS.blue }}>
                Total estimated cost: {recipe.totalCost.toFixed(2)} DKK
              </p>
              <p className="text-xs text-gray-500 mt-1">Prices based on current Lidl store offers</p>
            </div>

            {/* Back Button */}
            <button
              onClick={handleBack}
              className="w-full py-3 rounded-2xl font-nunito font-semibold border-2 transition-all duration-200 hover:bg-gray-50"
              style={{
                borderColor: LIDL_COLORS.blue,
                color: LIDL_COLORS.blue
              }}
            >
              ← Try another recipe
            </button>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg font-dm-sans font-semibold slide-up">
          ✅ Added to your Lidl Shopping List!
        </div>
      )}
    </div>
  );
}

export default App;
