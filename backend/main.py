from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
import json
import base64
from dotenv import load_dotenv
from groq import Groq
import google.generativeai as genai
from typing import List, Optional
from pydantic import BaseModel
import requests
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
import tempfile

# Load environment variables - try multiple locations
load_dotenv()  # Current directory
load_dotenv(dotenv_path="../.env")  # Parent directory

# Debug: Print if keys are loaded
print(f"GROQ_API_KEY loaded: {'Yes' if os.getenv('GROQ_API_KEY') else 'No'}")
print(f"GEMINI_API_KEY loaded: {'Yes' if os.getenv('GEMINI_API_KEY') else 'No'}")

app = FastAPI(title="Smart Calorie Counter API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.onrender.com", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize clients with error handling
try:
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise ValueError("GROQ_API_KEY not found in environment variables")
    groq_client = Groq(api_key=groq_api_key)
    print("✓ Groq client initialized successfully")
except Exception as e:
    print(f"✗ Error initializing Groq client: {e}")
    groq_client = None

try:
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    genai.configure(api_key=gemini_api_key)
    print("✓ Gemini client initialized successfully")
except Exception as e:
    print(f"✗ Error initializing Gemini client: {e}")

class UserProfile(BaseModel):
    age: int
    sex: str
    dietary_preference: str
    allergies: List[str]
    health_goal: str
    num_meals: int

class IngredientInput(BaseModel):
    user_profile: UserProfile
    ingredients: List[str]

class NutritionInfo(BaseModel):
    calories: float
    protein: float
    carbs: float
    fat: float
    fiber: float

class MealPlan(BaseModel):
    meal_name: str
    ingredients: List[str]
    nutrition: NutritionInfo
    instructions: str

def calculate_daily_calories(age: int, sex: str, health_goal: str) -> int:
    if sex.lower() == "male":
        bmr = 88.362 + (13.397 * 70) + (4.799 * 175) - (5.677 * age)
    else:
        bmr = 447.593 + (9.247 * 60) + (3.098 * 165) - (4.330 * age)
    
    activity_multiplier = 1.5
    daily_calories = bmr * activity_multiplier
    
    if health_goal.lower() == "weight_loss":
        daily_calories *= 0.8
    elif health_goal.lower() == "weight_gain":
        daily_calories *= 1.2
    
    return int(daily_calories)

def get_nutrition_from_usda(ingredient: str) -> NutritionInfo:
    nutrition_db = {
        "chicken breast": {"calories": 165, "protein": 31, "carbs": 0, "fat": 3.6, "fiber": 0},
        "rice": {"calories": 130, "protein": 2.7, "carbs": 28, "fat": 0.3, "fiber": 0.4},
        "broccoli": {"calories": 25, "protein": 3, "carbs": 5, "fat": 0.3, "fiber": 2.6},
        "salmon": {"calories": 208, "protein": 20, "carbs": 0, "fat": 12, "fiber": 0},
        "eggs": {"calories": 155, "protein": 13, "carbs": 1.1, "fat": 11, "fiber": 0},
        "oats": {"calories": 389, "protein": 17, "carbs": 66, "fat": 7, "fiber": 11},
        "banana": {"calories": 89, "protein": 1.1, "carbs": 23, "fat": 0.3, "fiber": 2.6},
        "spinach": {"calories": 23, "protein": 2.9, "carbs": 3.6, "fat": 0.4, "fiber": 2.2},
        "sweet potato": {"calories": 86, "protein": 1.6, "carbs": 20, "fat": 0.1, "fiber": 3},
        "almonds": {"calories": 579, "protein": 21, "carbs": 22, "fat": 50, "fiber": 12}
    }
    
    ingredient_lower = ingredient.lower()
    for key in nutrition_db:
        if key in ingredient_lower or ingredient_lower in key:
            return NutritionInfo(**nutrition_db[key])
    
    return NutritionInfo(calories=100, protein=5, carbs=15, fat=3, fiber=2)

@app.post("/analyze-ingredients")
async def analyze_ingredients(data: IngredientInput):
    total_nutrition = NutritionInfo(calories=0, protein=0, carbs=0, fat=0, fiber=0)
    
    for ingredient in data.ingredients:
        nutrition = get_nutrition_from_usda(ingredient)
        total_nutrition.calories += nutrition.calories
        total_nutrition.protein += nutrition.protein
        total_nutrition.carbs += nutrition.carbs
        total_nutrition.fat += nutrition.fat
        total_nutrition.fiber += nutrition.fiber
    
    daily_calories = calculate_daily_calories(
        data.user_profile.age, 
        data.user_profile.sex, 
        data.user_profile.health_goal
    )
    
    return {
        "nutrition": total_nutrition,
        "daily_calorie_target": daily_calories,
        "percentage_of_daily": round((total_nutrition.calories / daily_calories) * 100, 1)
    }

@app.post("/analyze-photo")
async def analyze_photo(
    file: UploadFile = File(...),
    user_profile: str = Form(...)
):
    profile_data = json.loads(user_profile)
    profile = UserProfile(**profile_data)
    
    contents = await file.read()
    
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    prompt = """
    You are a nutrition expert analyzing a food image. Please:
    
    1. Identify all visible food items in this image
    2. Estimate the portion size for each item (e.g., "1 cup", "100g", "1 medium piece")
    3. List the main ingredients for each food item
    4. Provide your analysis in a clear, structured format
    
    Focus on being accurate with food identification and realistic with portion estimates.
    If you see multiple items, analyze each one separately.
    
    Format your response as:
    Food Item 1: [name] - [portion estimate]
    Main ingredients: [ingredient1, ingredient2, etc.]
    
    Food Item 2: [name] - [portion estimate] 
    Main ingredients: [ingredient1, ingredient2, etc.]
    """
    
    try:
        # Convert image to PIL Image for better processing
        from PIL import Image
        import io
        
        image = Image.open(io.BytesIO(contents))
        
        response = model.generate_content([prompt, image])
        
        # Extract ingredients from the response
        food_analysis = response.text
        
        if not groq_client:
            # Fallback: simple text parsing
            import re
            # Extract text after "ingredients:" patterns
            ingredient_pattern = r'ingredients?:\s*\[?([^\n\]]+)'
            matches = re.findall(ingredient_pattern, food_analysis, re.IGNORECASE)
            ingredients = []
            for match in matches:
                # Split by commas and clean up
                items = [item.strip(' ,"\'') for item in match.split(',')]
                ingredients.extend(items)
            
            if not ingredients:
                # Fallback if no pattern matches
                ingredients = ["chicken", "rice", "vegetables"]
        else:
            groq_response = groq_client.chat.completions.create(
                messages=[{
                    "role": "user", 
                    "content": f"Extract all food ingredients from this analysis as a simple comma-separated list. Only return the ingredient names, nothing else:\n\n{food_analysis}"
                }],
                model="mixtral-8x7b-32768",
                temperature=0.1
            )
            ingredients_text = groq_response.choices[0].message.content.strip()
            ingredients = [ing.strip() for ing in ingredients_text.split(',') if ing.strip()]
        
        total_nutrition = NutritionInfo(calories=0, protein=0, carbs=0, fat=0, fiber=0)
        
        for ingredient in ingredients[:10]:
            nutrition = get_nutrition_from_usda(ingredient)
            total_nutrition.calories += nutrition.calories
            total_nutrition.protein += nutrition.protein
            total_nutrition.carbs += nutrition.carbs
            total_nutrition.fat += nutrition.fat
            total_nutrition.fiber += nutrition.fiber
        
        daily_calories = calculate_daily_calories(profile.age, profile.sex, profile.health_goal)
        
        return {
            "identified_foods": food_analysis,
            "extracted_ingredients": ingredients,
            "nutrition": total_nutrition,
            "daily_calorie_target": daily_calories,
            "percentage_of_daily": round((total_nutrition.calories / daily_calories) * 100, 1)
        }
        
    except Exception as e:
        return {"error": f"Failed to analyze image: {str(e)}"}

@app.post("/generate-meal-plan")
async def generate_meal_plan(data: UserProfile):
    daily_calories = calculate_daily_calories(data.age, data.sex, data.health_goal)
    calories_per_meal = daily_calories // data.num_meals
    
    dietary_restrictions = f"dietary preference: {data.dietary_preference}"
    if data.allergies:
        dietary_restrictions += f", allergies: {', '.join(data.allergies)}"
    
    prompt = f"""
    Create a daily meal plan for someone with these requirements:
    - Daily calorie target: {daily_calories}
    - Number of meals: {data.num_meals}
    - Calories per meal: approximately {calories_per_meal}
    - {dietary_restrictions}
    - Health goal: {data.health_goal}
    
    For each meal, provide:
    1. Meal name
    2. List of ingredients with quantities
    3. Brief cooking instructions
    4. Estimated nutrition (calories, protein, carbs, fat)
    
    Format as JSON with this structure:
    {{
        "meals": [
            {{
                "meal_name": "Breakfast",
                "ingredients": ["ingredient with quantity"],
                "instructions": "cooking steps",
                "nutrition": {{"calories": 400, "protein": 20, "carbs": 45, "fat": 15}}
            }}
        ],
        "total_nutrition": {{"calories": {daily_calories}, "protein": 120, "carbs": 300, "fat": 80}},
        "shopping_list": ["consolidated ingredient list"]
    }}
    """
    
    try:
        if not groq_client:
            # Fallback meal plan
            fallback_plan = f"""
Daily Meal Plan ({daily_calories} calories)

Breakfast ({calories_per_meal} calories):
- Oatmeal with banana and almonds
- Greek yogurt
- Coffee or tea

Lunch ({calories_per_meal} calories):
- Grilled chicken breast
- Rice and vegetables
- Mixed salad

Dinner ({calories_per_meal} calories):
- Baked salmon
- Sweet potato
- Steamed broccoli

Shopping List:
- Oats, banana, almonds, Greek yogurt
- Chicken breast, rice, mixed vegetables
- Salmon, sweet potato, broccoli
"""
            return {"meal_plan": fallback_plan}
        
        response = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="mixtral-8x7b-32768",
            temperature=0.3
        )
        
        return {"meal_plan": response.choices[0].message.content}
        
    except Exception as e:
        return {"error": f"Failed to generate meal plan: {str(e)}"}

@app.post("/export-pdf")
async def export_pdf(meal_plan_data: dict):
    try:
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        
        c = canvas.Canvas(temp_file.name, pagesize=letter)
        width, height = letter
        
        c.setFont("Helvetica-Bold", 16)
        c.drawString(50, height - 50, "Daily Meal Plan")
        
        y_position = height - 100
        c.setFont("Helvetica", 12)
        
        meal_plan_text = meal_plan_data.get("meal_plan", "No meal plan provided")
        
        lines = meal_plan_text.split('\n')
        for line in lines:
            if y_position < 50:
                c.showPage()
                y_position = height - 50
            
            c.drawString(50, y_position, line[:80])
            y_position -= 20
        
        c.save()
        
        return FileResponse(
            temp_file.name,
            media_type='application/pdf',
            filename='meal_plan.pdf'
        )
        
    except Exception as e:
        return {"error": f"Failed to generate PDF: {str(e)}"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "smart-calorie-counter-api"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)