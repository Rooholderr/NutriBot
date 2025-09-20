#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';

class NutriBot {
  constructor() {
    this.userData = {};
    this.mealPlans = {
      weightLoss: {
        name: 'Pérdida de peso',
        description: 'Plan balanceado con déficit calórico moderado',
        meals: {
          breakfast: 'Avena (40g) con 1 taza de frutas mixtas y 30g de nueces',
          lunch: 'Ensalada con 150g de proteína magra (pollo/atún) y 2 tazas de vegetales mixtos',
          dinner: '150g de pescado al horno con 2 tazas de vegetales al vapor',
          snacks: ['1 taza de yogur griego (200g)', '1 pieza de fruta fresca (manzana/plátano)']
        }
      },
      muscleGain: {
        name: 'Ganancia muscular',
        description: 'Plan con excedente calórico y alto contenido proteico',
        meals: {
          breakfast: '3 huevos revueltos con 1/2 aguacate y 2 rebanadas de pan integral',
          lunch: '200g de pollo con 1 taza de arroz integral y 2 tazas de vegetales',
          dinner: '200g de carne magra con 1 batata mediana y 2 tazas de brócoli',
          snacks: ['Batido de proteínas (30g proteína en polvo)', '30g de frutos secos mixtos']
        }
      },
      maintenance: {
        name: 'Mantenimiento',
        description: 'Plan balanceado para mantener peso actual',
        meals: {
          breakfast: '2 tostadas integrales con 1/2 aguacate y 2 huevos',
          lunch: 'Ensalada con 1 taza de quinoa, 2 tazas de vegetales y 120g de proteína',
          dinner: '180g de salmón con 2 tazas de vegetales asados',
          snacks: ['1 pieza de fruta mediana', '1 taza de yogur natural (200g)']
        }
      }
    };
  }

  async start() {
    console.log(chalk.green.bold('\n🥗 NutriBot - Asesor de Alimentación Saludable\n'));
    
    await this.collectUserData();
    await this.calculateNutrition();
    await this.showMealPlan();
    await this.suggestRecipes();
  }

  async collectUserData() {
    const answers = await inquirer.prompt([
      {
        type: 'number',
        name: 'age',
        message: '¿Cuál es tu edad?',
        validate: input => input > 0 || 'Por favor ingresa una edad válida'
      },
      {
        type: 'number',
        name: 'weight',
        message: '¿Cuál es tu peso actual (kg)?',
        validate: input => input > 0 || 'Por favor ingresa un peso válido'
      },
      {
        type: 'number',
        name: 'height',
        message: '¿Cuál es tu altura (cm)?',
        validate: input => input > 0 || 'Por favor ingresa una altura válida'
      },
      {
        type: 'list',
        name: 'activity',
        message: 'Nivel de actividad física:',
        choices: [
          'Sedentario (poco o ningún ejercicio)',
          'Ligero (ejercicio 1-3 días/semana)',
          'Moderado (ejercicio 3-5 días/semana)',
          'Activo (ejercicio 6-7 días/semana)',
          'Muy activo (ejercicio intenso diario)'
        ]
      },
      {
        type: 'list',
        name: 'goal',
        message: '¿Cuál es tu objetivo principal?',
        choices: [
          'Bajar de peso',
          'Ganar masa muscular',
          'Mantener peso actual'
        ]
      }
    ]);

    this.userData = answers;
    console.log(chalk.blue('\n✓ Datos guardados correctamente\n'));
  }

  calculateNutrition() {
    const { weight, height, age, activity, goal } = this.userData;
    
    const activityMultipliers = {
      'Sedentario (poco o ningún ejercicio)': 1.2,
      'Ligero (ejercicio 1-3 días/semana)': 1.375,
      'Moderado (ejercicio 3-5 días/semana)': 1.55,
      'Activo (ejercicio 6-7 días/semana)': 1.725,
      'Muy activo (ejercicio intenso diario)': 1.9
    };

    const goalMultipliers = {
      'Bajar de peso': 0.85,
      'Ganar masa muscular': 1.15,
      'Mantener peso actual': 1.0
    };

    const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    const tdee = bmr * activityMultipliers[activity];
    const targetCalories = Math.round(tdee * goalMultipliers[goal]);

    const protein = Math.round(weight * 2.2);
    const fat = Math.round((targetCalories * 0.25) / 9);
    const carbs = Math.round((targetCalories - (protein * 4 + fat * 9)) / 4);

    this.nutritionData = {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories,
      protein,
      fat,
      carbs
    };

    console.log(chalk.yellow.bold('\n📊 Análisis Nutricional:'));
    console.log(chalk.yellow(`Metabolismo basal (BMR): ${this.nutritionData.bmr} kcal`));
    console.log(chalk.yellow(`Gasto energético total (TDEE): ${this.nutritionData.tdee} kcal`));
    console.log(chalk.green.bold(`\n🎯 Objetivo diario:`));
    console.log(chalk.green(`Calorías: ${this.nutritionData.targetCalories} kcal`));
    console.log(chalk.green(`Proteínas: ${this.nutritionData.protein}g`));
    console.log(chalk.green(`Grasas: ${this.nutritionData.fat}g`));
    console.log(chalk.green(`Carbohidratos: ${this.nutritionData.carbs}g\n`));
  }

  async showMealPlan() {
    const { goal } = this.userData;
    const planKey = {
      'Bajar de peso': 'weightLoss',
      'Ganar masa muscular': 'muscleGain',
      'Mantener peso actual': 'maintenance'
    }[goal];

    const plan = this.mealPlans[planKey];

    console.log(chalk.cyan.bold(`🍽️ Plan de alimentación: ${plan.name}`));
    console.log(chalk.cyan(plan.description));
    console.log(chalk.cyan('\nComidas del día:'));
    console.log(chalk.cyan(`Desayuno: ${plan.meals.breakfast}`));
    console.log(chalk.cyan(`Almuerzo: ${plan.meals.lunch}`));
    console.log(chalk.cyan(`Cena: ${plan.meals.dinner}`));
    console.log(chalk.cyan(`Snacks: ${plan.meals.snacks.join(', ')}\n`));

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: '¿Te gustaría ver recetas específicas?',
        default: true
      }
    ]);

    if (confirm) {
      await this.suggestRecipes();
    }
  }

  async suggestRecipes() {
    const commonIngredients = [
      'pollo', 'huevos', 'arroz', 'pasta', 'vegetales', 'frutas',
      'pescado', 'carne', 'legumbres', 'lácteos', 'frutos secos'
    ];

    const { ingredients } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'ingredients',
        message: '¿Qué ingredientes tienes disponibles?',
        choices: commonIngredients,
        pageSize: 10
      }
    ]);

    console.log(chalk.magenta.bold('\n🍳 Recetas sugeridas:'));
    
    if (ingredients.includes('pollo') && ingredients.includes('vegetales')) {
      console.log(chalk.magenta('• Pollo salteado con vegetales mixtos'));
    }
    if (ingredients.includes('huevos') && ingredients.includes('vegetales')) {
      console.log(chalk.magenta('• Tortilla de espinacas y champiñones'));
    }
    if (ingredients.includes('pescado') && ingredients.includes('vegetales')) {
      console.log(chalk.magenta('• Filete de pescado al horno con brócoli'));
    }
    if (ingredients.includes('arroz') && ingredients.includes('legumbres')) {
      console.log(chalk.magenta('• Arroz integral con lentejas'));
    }
    if (ingredients.includes('frutas') && ingredients.includes('lácteos')) {
      console.log(chalk.magenta('• Batido de frutas con yogur griego'));
    }

    console.log(chalk.magenta('\n💡 Consejo: Combina proteínas con carbohidratos complejos y vegetales para comidas balanceadas.\n'));
  }
}

const bot = new NutriBot();
bot.start().catch(console.error);