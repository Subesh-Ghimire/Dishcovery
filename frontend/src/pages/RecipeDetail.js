import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Clock, Users, ChefHat } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadRecipe();
    checkFavorite();
  }, [id]);

  const loadRecipe = async () => {
    try {
      const response = await axios.get(`${API}/recipes`);
      const found = response.data.find((r) => r.id === id);
      if (found) {
        setRecipe(found);
      } else {
        toast.error("Recipe not found");
        navigate("/");
      }
    } catch (error) {
      console.error("Error loading recipe:", error);
      toast.error("Failed to load recipe");
    }
  };

  const checkFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("dishcovery_favorites") || "[]");
    setIsFavorite(favorites.includes(id));
  };

  const toggleFavorite = async () => {
    const favorites = JSON.parse(localStorage.getItem("dishcovery_favorites") || "[]");
    
    if (isFavorite) {
      const updated = favorites.filter((fid) => fid !== id);
      localStorage.setItem("dishcovery_favorites", JSON.stringify(updated));
      setIsFavorite(false);
      toast.success("Removed from favorites");
    } else {
      favorites.push(id);
      localStorage.setItem("dishcovery_favorites", JSON.stringify(favorites));
      setIsFavorite(true);
      toast.success("Added to favorites");
      
      // Save recipe to backend
      if (recipe) {
        try {
          await axios.post(`${API}/recipes/save`, { recipe });
        } catch (error) {
          console.error("Error saving recipe:", error);
        }
      }
    }
  };

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading recipe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            data-testid="back-button"
            variant="ghost"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-primary" />
            <span className="text-xl font-serif font-bold text-primary">Dishcovery</span>
          </Link>
        </div>
      </header>

      {/* Recipe Content */}
      <article className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-serif font-bold text-foreground mb-4" data-testid="recipe-title">
            {recipe.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-6">{recipe.description}</p>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 mb-6">
            {recipe.prep_time && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-accent" />
                <span className="text-muted-foreground">Prep: {recipe.prep_time}</span>
              </div>
            )}
            {recipe.cook_time && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-accent" />
                <span className="text-muted-foreground">Cook: {recipe.cook_time}</span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-accent" />
                <span className="text-muted-foreground">{recipe.servings}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {recipe.dietary_tags?.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
            {recipe.health_tags?.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
          </div>

          <Button
            data-testid="favorite-button"
            onClick={toggleFavorite}
            className={`rounded-full ${isFavorite ? 'bg-accent hover:bg-accent/90' : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'}`}
          >
            <Heart className={`w-5 h-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
            {isFavorite ? "Saved" : "Save to Favorites"}
          </Button>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-5 gap-12">
          {/* Ingredients */}
          <div className="md:col-span-2">
            <div className="sticky top-24">
              <h2 className="text-2xl font-serif font-bold mb-6">Ingredients</h2>
              <div className="bg-card rounded-3xl p-8 shadow-sm">
                <ul className="space-y-3" data-testid="ingredients-list">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                      <span className="text-base">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="md:col-span-3">
            <h2 className="text-2xl font-serif font-bold mb-6">Instructions</h2>
            <div className="space-y-6" data-testid="instructions-list">
              {recipe.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <p className="text-base pt-2 flex-1">{instruction}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default RecipeDetail;