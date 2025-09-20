let userData = {};
let nutritionData = {};
let currentGoal = '';

const userForm = document.getElementById('userForm');

userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    userData = {
        age: parseInt(document.getElementById('age').value),
        weight: parseFloat(document.getElementById('weight').value),
        height: parseInt(document.getElementById('height').value),
        activity: document.getElementById('activity').value,
        goal: document.getElementById('goal').value
    };
    
    try {
        const response = await fetch('/api/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            nutritionData = await response.json();
            showNutritionResults();
            showStep(2);
        } else {
            alert('Error al calcular la nutrición');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
});

function showNutritionResults() {
    const resultsDiv = document.getElementById('nutritionResults');
    resultsDiv.innerHTML = `
        <h3>📊 Tu Análisis Nutricional</h3>
        <p><strong>Metabolismo basal (BMR):</strong> ${nutritionData.bmr} kcal</p>
        <p><strong>Gasto energético total (TDEE):</strong> ${nutritionData.tdee} kcal</p>
        
        <h3>🎯 Objetivo Diario</h3>
        <p><strong>Calorías:</strong> ${nutritionData.targetCalories} kcal</p>
        <p><strong>Proteínas:</strong> ${nutritionData.protein}g</p>
        <p><strong>Grasas:</strong> ${nutritionData.fat}g</p>
        <p><strong>Carbohidratos:</strong> ${nutritionData.carbs}g</p>
    `;
}

async function showMealPlan() {
    currentGoal = userData.goal;
    
    try {
        const response = await fetch(`/api/meal-plan/${currentGoal}`);
        if (response.ok) {
            const mealPlan = await response.json();
            displayMealPlan(mealPlan);
            showStep(3);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayMealPlan(plan) {
    const mealPlanDiv = document.getElementById('mealPlan');
    mealPlanDiv.innerHTML = `
        <h3>${plan.name}</h3>
        <p>${plan.description}</p>
        
        <div class="meal-item">
            <h4>🍳 Desayuno</h4>
            <p>${plan.meals.breakfast}</p>
        </div>
        
        <div class="meal-item">
            <h4>🍽️ Almuerzo</h4>
            <p>${plan.meals.lunch}</p>
        </div>
        
        <div class="meal-item">
            <h4>🌙 Cena</h4>
            <p>${plan.meals.dinner}</p>
        </div>
        
        <div class="meal-item">
            <h4>🍎 Snacks</h4>
            <p>${plan.meals.snacks.join(', ')}</p>
        </div>
    `;
}

function showRecipes() {
    showStep(4);
}

async function getRecipes() {
    const selectedIngredients = Array.from(
        document.querySelectorAll('input[name="ingredient"]:checked')
    ).map(input => input.value);
    
    if (selectedIngredients.length === 0) {
        alert('Por favor selecciona al menos un ingrediente');
        return;
    }
    
    try {
        const response = await fetch('/api/recipes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ingredients: selectedIngredients })
        });
        
        if (response.ok) {
            const recipes = await response.json();
            displayRecipes(recipes);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayRecipes(recipes) {
    const recipesDiv = document.getElementById('recipes');
    
    if (recipes.length === 0) {
        recipesDiv.innerHTML = `
            <div class="recipe-card">
                <h3>No hay recetas disponibles</h3>
                <p>No encontramos recetas que coincidan con tus ingredientes seleccionados.</p>
                <p>💡 Intenta seleccionar diferentes ingredientes o combinar proteínas con vegetales.</p>
            </div>
        `;
        return;
    }
    
    recipesDiv.innerHTML = recipes.map(recipe => `
        <div class="recipe-card">
            <h3>${recipe.title}</h3>
            <p>${recipe.description}</p>
            
            <div class="recipe-meta">
                <span>🔥 ${recipe.calories} kcal</span>
                <span>⏱️ ${recipe.prepTime}</span>
                <span>📊 ${recipe.difficulty}</span>
            </div>
            
            <div class="ingredients-list">
                <h4>Ingredientes:</h4>
                <ul>
                    ${recipe.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                </ul>
            </div>
            
            <div class="instructions">
                <h4>Instrucciones:</h4>
                <ol>
                    ${recipe.instructions.map(step => `<li>${step}</li>`).join('')}
                </ol>
            </div>
        </div>
    `).join('');
}

function showStep(stepNumber) {
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById(`step${stepNumber}`).classList.add('active');
}

function goToStep(stepNumber) {
    showStep(stepNumber);
}