#!/usr/bin/env node

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/calculate', (req, res) => {
  const { age, weight, height, activity, goal } = req.body;
  
  const activityMultipliers = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'active': 1.725,
    'very_active': 1.9
  };

  const goalMultipliers = {
    'weight_loss': 0.85,
    'muscle_gain': 1.15,
    'maintenance': 1.0
  };

  const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  const tdee = bmr * activityMultipliers[activity];
  const targetCalories = Math.round(tdee * goalMultipliers[goal]);

  const protein = Math.round(weight * 2.2);
  const fat = Math.round((targetCalories * 0.25) / 9);
  const carbs = Math.round((targetCalories - (protein * 4 + fat * 9)) / 4);

  res.json({
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories,
    protein,
    fat,
    carbs
  });
});

app.get('/api/meal-plan/:goal', (req, res) => {
  const { goal } = req.params;
  
  const mealPlans = {
    weight_loss: {
      name: 'Pérdida de peso',
      description: 'Plan balanceado con déficit calórico moderado',
        meals: {
          breakfast: 'Avena (40g) con 1 taza de frutas mixtas y 30g de nueces (350 kcal)',
          lunch: 'Ensalada con 150g de proteína magra (pollo/atún) y 2 tazas de vegetales mixtos (450 kcal)',
          dinner: '150g de pescado al horno con 2 tazas de vegetales al vapor (400 kcal)',
          snacks: ['1 taza de yogur griego (200g) (150 kcal)', '1 pieza de fruta fresca (manzana/plátano) (100 kcal)']
        }
    },
    muscle_gain: {
      name: 'Ganancia muscular',
      description: 'Plan con excedente calórico y alto contenido proteico',
        meals: {
          breakfast: '3 huevos revueltos con 1/2 aguacate y 2 rebanadas de pan integral (500 kcal)',
          lunch: '200g de pollo con 1 taza de arroz integral y 2 tazas de vegetales (600 kcal)',
          dinner: '200g de carne magra con 1 batata mediana y 2 tazas de brócoli (550 kcal)',
          snacks: ['Batido de proteínas (30g proteína en polvo) (300 kcal)', '30g de frutos secos mixtos (200 kcal)']
        }
    },
    maintenance: {
      name: 'Mantenimiento',
      description: 'Plan balanceado para mantener peso actual',
        meals: {
          breakfast: '2 tostadas integrales con 1/2 aguacate y 2 huevos (450 kcal)',
          lunch: 'Ensalada con 1 taza de quinoa, 2 tazas de vegetales y 120g de proteína (500 kcal)',
          dinner: '180g de salmón con 2 tazas de vegetales asados (480 kcal)',
          snacks: ['1 pieza de fruta mediana (120 kcal)', '1 taza de yogur natural (200g) (180 kcal)']
        }
    }
  };

  res.json(mealPlans[goal] || mealPlans.maintenance);
});

app.post('/api/recipes', (req, res) => {
  const { ingredients } = req.body;
  
  const recipes = {
    pollo: {
      title: 'Pollo Salteado con Vegetales',
      description: 'Plato rápido y saludable con proteína magra y vegetales frescos',
      ingredients: ['300g pechuga de pollo', '2 tazas de vegetales mixtos', '1 cda aceite de oliva', 'especias al gusto'],
      instructions: ['Cortar el pollo en tiras', 'Saltear en aceite caliente', 'Añadir vegetales y cocinar 5 min', 'Condimentar y servir'],
      calories: 380,
      prepTime: '15 min',
      difficulty: 'Fácil'
    },
    huevos: {
      title: 'Tortilla de Espinacas y Champiñones',
      description: 'Tortilla nutritiva cargada de proteínas y vegetales',
      ingredients: ['3 huevos', '1 taza de espinacas', '1/2 taza de champiñones', 'queso bajo en grasa opcional'],
      instructions: ['Batir los huevos', 'Saltear vegetales', 'Verter huevos sobre vegetales', 'Cocinar a fuego medio'],
      calories: 280,
      prepTime: '10 min',
      difficulty: 'Fácil'
    },
    pescado: {
      title: 'Filete de Pescado al Horno con Brócoli',
      description: 'Pescado horneado con brócoli al limón, bajo en calorías',
      ingredients: ['200g filete de pescado', '2 tazas de brócoli', 'limón', 'hierbas aromáticas'],
      instructions: ['Precalentar horno a 200°C', 'Sazonar pescado y brócoli', 'Hornear 15-20 min', 'Exprimir limón al servir'],
      calories: 320,
      prepTime: '25 min',
      difficulty: 'Medio'
    },
    arroz: {
      title: 'Arroz Integral con Lentejas',
      description: 'Completa combinación de carbohidratos complejos y proteína vegetal',
      ingredients: ['1 taza de arroz integral', '1/2 taza de lentejas', 'cebolla', 'ajo', 'especias'],
      instructions: ['Cocinar arroz y lentejas por separado', 'Saltear cebolla y ajo', 'Mezclar todos los ingredientes', 'Cocinar 10 min más'],
      calories: 420,
      prepTime: '40 min',
      difficulty: 'Medio'
    },
    frutas: {
      title: 'Batido de Frutas con Yogur Griego',
      description: 'Batido refrescante cargado de proteínas y vitaminas',
      ingredients: ['1 taza de yogur griego', '1 taza de frutas mixtas', '1 cda miel opcional', 'hielo'],
      instructions: ['Mezclar todos los ingredientes en licuadora', 'Licuar hasta obtener consistencia suave', 'Servir inmediatamente'],
      calories: 250,
      prepTime: '5 min',
      difficulty: 'Fácil'
    }
  };

  const suggestedRecipes = [];
  
  if (ingredients.includes('pollo') && ingredients.includes('vegetales')) {
    suggestedRecipes.push(recipes.pollo);
  }
  if (ingredients.includes('huevos') && ingredients.includes('vegetales')) {
    suggestedRecipes.push(recipes.huevos);
  }
  if (ingredients.includes('pescado') && ingredients.includes('vegetales')) {
    suggestedRecipes.push(recipes.pescado);
  }
  if (ingredients.includes('arroz') && ingredients.includes('legumbres')) {
    suggestedRecipes.push(recipes.arroz);
  }
  if (ingredients.includes('frutas') && ingredients.includes('lácteos')) {
    suggestedRecipes.push(recipes.frutas);
  }

  res.json(suggestedRecipes);
});

app.listen(PORT, () => {
  console.log(`🚀 NutriBot GUI running on http://localhost:${PORT}`);
  console.log('🥗 Abre tu navegador y visita la aplicación web');
});