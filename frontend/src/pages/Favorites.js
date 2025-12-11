import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChefHat, Heart } from "lucide-react";
import RecipeCard from "@/components/RecipeCard";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const favoriteIds = JSON.parse(localStorage.getItem("dishcovery_favorites") || "[]");
      
      if (favoriteIds.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API}/recipes`);
      const favoriteRecipes = response.data.filter((recipe) =>
        favoriteIds.includes(recipe.id)
      );
      
      setFavorites(favoriteRecipes);
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" data-testid="back-to-home-link">
            <Button variant="ghost" className="rounded-full">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-primary" />
            <span className="text-xl font-serif font-bold text-primary">Dishcovery</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-serif font-bold text-foreground mb-4">
            <Heart className="w-12 h-12 inline-block mb-2 mr-3 text-accent" />
            Your Favorites
          </h1>
          <p className="text-lg text-muted-foreground">
            All your saved recipes in one place
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <ChefHat className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Loading favorites...</p>
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="favorites-grid">
            {favorites.map((recipe, index) => (
              <RecipeCard key={recipe.id} recipe={recipe} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16" data-testid="empty-favorites">
            <div className="max-w-md mx-auto">
              <img
                src="https://images.unsplash.com/photo-1644583407622-bfe687865d2e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwzfHxhZXN0aGV0aWMlMjBoZWFsdGh5JTIwZm9vZCUyMHBsYXRlZCUyMG1pbmltYWxpc3R8ZW58MHx8fHwxNzY1MjU4OTE0fDA&ixlib=rb-4.1.0&q=85"
                alt="No favorites yet"
                className="w-full h-64 object-cover rounded-3xl mb-6"
              />
              <h3 className="text-2xl font-serif font-bold mb-4">No favorites yet</h3>
              <p className="text-muted-foreground mb-6">
                Start exploring recipes and save your favorites here!
              </p>
              <Link to="/">
                <Button className="rounded-full bg-primary hover:bg-primary/90">
                  Discover Recipes
                </Button>
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Favorites;