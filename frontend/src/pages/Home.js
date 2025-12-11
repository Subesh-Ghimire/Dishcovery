import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RecipeCard from "@/components/RecipeCard";
import { toast } from "sonner";
import { Loader2, ChefHat, Heart, Settings, Sparkles } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [preferences, setPreferences] = useState({
    dietary: [],
    health: []
  });

  useEffect(() => {
    const stored = localStorage.getItem("dishcovery_preferences");
    if (stored) {
      setPreferences(JSON.parse(stored));
    }
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const response = await axios.get(`${API}/recipes`);
      setRecipes(response.data);
    } catch (error) {
      console.error("Error loading recipes:", error);
    }
  };

  const generateRecipe = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter what you'd like to cook");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/recipes/generate`, {
        prompt: prompt,
        dietary_preferences: preferences.dietary,
        health_conditions: preferences.health
      });

      toast.success("Recipe generated successfully!");
      setRecipes([response.data, ...recipes]);
      setPrompt("");
    } catch (error) {
      console.error("Error generating recipe:", error);
      
      // Extract error message from response
      let errorMessage = "Failed to generate recipe. Please try again.";
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (detail.includes("quota") || detail.includes("rate limit")) {
          errorMessage = "AI service quota exceeded. Please check your API key or try again later.";
        } else if (detail.includes("API key")) {
          errorMessage = "Invalid API key. Please check your configuration.";
        } else {
          errorMessage = detail;
        }
      }
      
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      generateRecipe();
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <ChefHat className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-serif font-bold text-primary">Dishcovery</h1>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/favorites" data-testid="favorites-nav-link">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Heart className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/preferences" data-testid="preferences-nav-link">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-5xl sm:text-6xl font-serif font-bold text-foreground mb-4">
            Discover Your Next
            <br />
            <span className="text-accent">Delicious Meal</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tell us what you're craving, what's in your kitchen, or your dietary needs.
            <br />Our AI will craft the perfect recipe just for you.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex gap-3">
            <Input
              data-testid="recipe-search-input"
              type="text"
              placeholder="Try 'healthy dinner', 'vegan breakfast', or 'quick lunch with potatoes'..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 h-14 rounded-full px-6 text-base input-search border-2"
              disabled={loading}
            />
            <Button
              data-testid="generate-recipe-button"
              onClick={generateRecipe}
              disabled={loading}
              className="h-14 px-8 rounded-full button-primary bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>

          {/* Active Preferences Display */}
          {(preferences.dietary.length > 0 || preferences.health.length > 0) && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {preferences.dietary.map((pref) => (
                <span
                  key={pref}
                  className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
                >
                  {pref}
                </span>
              ))}
              {preferences.health.map((health) => (
                <span
                  key={health}
                  className="px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full"
                >
                  {health}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Example Prompts */}
        <div className="flex flex-wrap gap-3 justify-center mb-16">
          {[
            "Healthy dinner",
            "Vegan breakfast",
            "Quick lunch",
            "Comfort food",
            "Low carb dinner"
          ].map((example) => (
            <button
              key={example}
              onClick={() => setPrompt(example)}
              className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm rounded-full transition-colors"
              data-testid={`example-prompt-${example.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {example}
            </button>
          ))}
        </div>
      </section>

      {/* Recipe Results */}
      {recipes.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-16">
          <h3 className="text-3xl font-serif font-bold mb-8">Recent Recipes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe, index) => (
              <RecipeCard key={recipe.id} recipe={recipe} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {recipes.length === 0 && !loading && (
        <section className="max-w-7xl mx-auto px-6 pb-16 text-center">
          <div className="max-w-md mx-auto">
            <img
              src="https://images.unsplash.com/photo-1700150618387-3f46b6d2cf8e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHZlZ2V0YWJsZXMlMjBpbmdyZWRpZW50cyUyMG92ZXJoZWFkJTIwYWVzdGhldGljfGVufDB8fHx8MTc2NTI1ODkxMXww&ixlib=rb-4.1.0&q=85"
              alt="Fresh ingredients"
              className="w-full h-64 object-cover rounded-3xl mb-6"
            />
            <p className="text-lg text-muted-foreground">
              Start by telling us what you'd like to cook today!
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;