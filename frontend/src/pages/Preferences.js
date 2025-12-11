import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChefHat, Check } from "lucide-react";
import { toast } from "sonner";

const DIETARY_OPTIONS = [
  "Vegan",
  "Vegetarian",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
  "Keto",
  "Paleo",
  "Pescatarian",
  "Halal",
  "Kosher"
];

const HEALTH_OPTIONS = [
  "Diabetes-Friendly",
  "Low Sodium",
  "Heart Healthy",
  "High Blood Pressure",
  "Low Cholesterol",
  "Low Sugar",
  "High Protein",
  "Low Carb",
  "Weight Management"
];

const Preferences = () => {
  const navigate = useNavigate();
  const [dietary, setDietary] = useState([]);
  const [health, setHealth] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("dishcovery_preferences");
    if (stored) {
      const prefs = JSON.parse(stored);
      setDietary(prefs.dietary || []);
      setHealth(prefs.health || []);
    }
  }, []);

  const toggleDietary = (option) => {
    setDietary((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const toggleHealth = (option) => {
    setHealth((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const savePreferences = () => {
    const preferences = { dietary, health };
    localStorage.setItem("dishcovery_preferences", JSON.stringify(preferences));
    toast.success("Preferences saved successfully!");
    setTimeout(() => navigate("/"), 800);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" data-testid="back-to-home-preferences">
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
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-serif font-bold text-foreground mb-4">
            Your Preferences
          </h1>
          <p className="text-lg text-muted-foreground">
            Customize your recipe suggestions based on your dietary needs and health goals
          </p>
        </div>

        {/* Dietary Preferences */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-bold mb-6">Dietary Preferences</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {DIETARY_OPTIONS.map((option) => {
              const isSelected = dietary.includes(option);
              return (
                <button
                  key={option}
                  data-testid={`dietary-option-${option.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => toggleDietary(option)}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{option}</span>
                    {isSelected && <Check className="w-5 h-5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Health Conditions */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-bold mb-6">Health Considerations</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {HEALTH_OPTIONS.map((option) => {
              const isSelected = health.includes(option);
              return (
                <button
                  key={option}
                  data-testid={`health-option-${option.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => toggleHealth(option)}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    isSelected
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-card hover:border-accent/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{option}</span>
                    {isSelected && <Check className="w-5 h-5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <Button
            data-testid="save-preferences-button"
            onClick={savePreferences}
            className="rounded-full px-12 h-14 text-base bg-primary hover:bg-primary/90"
          >
            Save Preferences
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Preferences;