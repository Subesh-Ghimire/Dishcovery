# server.py
from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

# Load environment variables first
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import Gemini wrapper after loading .env
from gemini_wrapper import LlmChat, UserMessage

# ------------------ MONGO SETUP ------------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# ------------------ FASTAPI SETUP ------------------
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ------------------ MODELS ------------------
class Recipe(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    ingredients: List[str]
    instructions: List[str]
    prep_time: Optional[str] = None
    cook_time: Optional[str] = None
    servings: Optional[str] = None
    dietary_tags: List[str] = Field(default_factory=list)
    health_tags: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RecipeGenerateRequest(BaseModel):
    prompt: str
    dietary_preferences: List[str] = Field(default_factory=list)
    health_conditions: List[str] = Field(default_factory=list)

class RecipeSaveRequest(BaseModel):
    recipe: Recipe

# ------------------ GEMINI CHAT ------------------
def get_gemini_chat():
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")

    chat = LlmChat(
        api_key=api_key,
        session_id="dishcovery-recipe-gen",
        system_message="""You are a creative culinary AI assistant for Dishcovery. 
Generate detailed, practical, and delicious recipes based on user input.
Return ONLY valid JSON in this format:
{
  "title": "Recipe Name",
  "description": "Brief appetizing description",
  "ingredients": ["ingredient 1", "ingredient 2", ...],
  "instructions": ["step 1", "step 2", ...],
  "prep_time": "15 minutes",
  "cook_time": "30 minutes",
  "servings": "4 servings",
  "dietary_tags": ["vegan", "gluten-free", ...],
  "health_tags": ["low-sodium", "diabetes-friendly", ...]
}"""
    ).with_model("gemini", "gemini-2.5-flash")

    return chat

# ------------------ ROUTES ------------------
@api_router.get("/")
async def root():
    return {"message": "Dishcovery API is running"}

@api_router.post("/recipes/generate", response_model=Recipe)
async def generate_recipe(request: RecipeGenerateRequest):
    try:
        chat = get_gemini_chat()
        dietary_info = f" Dietary preferences: {', '.join(request.dietary_preferences)}." if request.dietary_preferences else ""
        health_info = f" Health conditions to consider: {', '.join(request.health_conditions)}." if request.health_conditions else ""
        full_prompt = f"Generate a recipe for: {request.prompt}.{dietary_info}{health_info}"

        user_message = UserMessage(text=full_prompt)
        response = await chat.send_message(user_message)

        import json
        response_text = response.strip()
        # Remove code blocks if present
        if response_text.startswith('```'):
            lines = response_text.split('\n')
            response_text = '\n'.join(lines[1:-1]) if len(lines) > 2 else response_text
            if response_text.startswith('json'):
                response_text = response_text[4:].strip()

        recipe_data = json.loads(response_text)
        recipe = Recipe(**recipe_data)

        # Save to MongoDB
        doc = recipe.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.recipes.insert_one(doc)

        return recipe
    except Exception as e:
        logging.error(f"Error generating recipe: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate recipe: {str(e)}")

@api_router.get("/recipes", response_model=List[Recipe])
async def get_recipes():
    recipes = await db.recipes.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    for recipe in recipes:
        if isinstance(recipe['created_at'], str):
            recipe['created_at'] = datetime.fromisoformat(recipe['created_at'])
    return recipes

@api_router.post("/recipes/save", response_model=Recipe)
async def save_recipe(request: RecipeSaveRequest):
    doc = request.recipe.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    existing = await db.recipes.find_one({"id": doc['id']}, {"_id": 0})
    if not existing:
        await db.recipes.insert_one(doc)
    return request.recipe

# ------------------ APP SETUP ------------------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
