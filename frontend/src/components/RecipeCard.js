import { Link } from "react-router-dom";
import { Clock, Users } from "lucide-react";

export const RecipeCard = ({ recipe, index }) => {
  return (
    <Link to={`/recipe/${recipe.id}`} data-testid={`recipe-card-${index}`}>
      <div className="recipe-card bg-card rounded-3xl overflow-hidden shadow-sm hover:shadow-lg fade-in">
        {/* Image Placeholder with gradient */}
        <div
          className="h-48 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/30 flex items-center justify-center"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1597489619062-646198ac6030?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHw0fHxhZXN0aGV0aWMlMjBoZWFsdGh5JTIwZm9vZCUyMHBsYXRlZCUyMG1pbmltYWxpc3R8ZW58MHx8fHwxNzY1MjU4OTE0fDA&ixlib=rb-4.1.0&q=85)`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />

        <div className="p-6">
          <h3 className="text-xl font-serif font-bold mb-2 line-clamp-2">
            {recipe.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {recipe.description}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
            {recipe.prep_time && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{recipe.prep_time}</span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{recipe.servings}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {recipe.dietary_tags?.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
            {recipe.health_tags?.slice(0, 1).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;