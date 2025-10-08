#!/usr/bin/env node

const fs = require('fs');

// Simple question categorization and analysis
// Usage: node analyze-questions.js

function categorizeQuestion(question) {
  const q = question.toLowerCase();
  
  if (q.includes('recipe') || q.includes('how to cook') || q.includes('cooking instructions')) {
    return 'Recipe';
  }
  if (q.includes('substitute') || q.includes('instead of') || q.includes('ingredient') || q.includes('buy')) {
    return 'Ingredients';
  }
  if (q.includes('technique') || q.includes('method') || q.includes('temperature') || q.includes('time')) {
    return 'Techniques';
  }
  if (q.includes('meal plan') || q.includes('prep') || q.includes('menu') || q.includes('what to make')) {
    return 'Planning';
  }
  if (q.includes('fix') || q.includes('problem') || q.includes('wrong') || q.includes('adjust')) {
    return 'Troubleshooting';
  }
  
  return 'Other';
}

function analyzeQuestions() {
  try {
    const csvContent = fs.readFileSync('chatgpt-questions.csv', 'utf8');
    const lines = csvContent.split('\n').slice(1); // Skip header
    
    const categories = {};
    const allQuestions = [];
    
    lines.forEach(line => {
      if (line.trim()) {
        const [url, question, date] = line.split(',');
        const category = categorizeQuestion(question);
        
        categories[category] = (categories[category] || 0) + 1;
        allQuestions.push({ question, category, url });
      }
    });
    
    // Sort categories by frequency
    const sortedCategories = Object.entries(categories)
      .sort(([,a], [,b]) => b - a);
    
    console.log('\n=== QUESTION CATEGORY ANALYSIS ===');
    sortedCategories.forEach(([category, count]) => {
      console.log(`${category}: ${count} questions`);
    });
    
    console.log('\n=== SAMPLE QUESTIONS BY CATEGORY ===');
    sortedCategories.forEach(([category]) => {
      const questions = allQuestions.filter(q => q.category === category);
      console.log(`\n${category}:`);
      questions.slice(0, 3).forEach(q => {
        console.log(`  - ${q.question}`);
      });
    });
    
    // Save detailed results
    const results = {
      totalQuestions: allQuestions.length,
      categories: categories,
      questions: allQuestions
    };
    
    fs.writeFileSync('analysis-results.json', JSON.stringify(results, null, 2));
    console.log('\nDetailed results saved to analysis-results.json');
    
  } catch (error) {
    console.error('Error analyzing questions:', error.message);
  }
}

analyzeQuestions();
