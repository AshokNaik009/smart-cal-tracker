import React from 'react';
import {
  ChartBarIcon,
  FireIcon,
  HeartIcon,
  BeakerIcon,
  DocumentTextIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const NutritionCard = ({ results }) => {
  const nutritionItems = [
    { label: 'Calories', value: Math.round(results.nutrition?.calories || 0), icon: FireIcon, color: 'var(--accent-tertiary)' },
    { label: 'Protein', value: `${Math.round(results.nutrition?.protein || 0)}g`, icon: HeartIcon, color: 'var(--accent-primary)' },
    { label: 'Carbs', value: `${Math.round(results.nutrition?.carbs || 0)}g`, icon: BeakerIcon, color: 'var(--accent-secondary)' },
    { label: 'Fat', value: `${Math.round(results.nutrition?.fat || 0)}g`, icon: DocumentTextIcon, color: 'var(--accent-tertiary)' },
    { label: 'Fiber', value: `${Math.round(results.nutrition?.fiber || 0)}g`, icon: SparklesIcon, color: 'var(--accent-primary)' }
  ];

  return (
    <div className="nutrition-card">
      <div className="flex items-center gap-3 mb-6">
        <ChartBarIcon className="w-6 h-6" style={{color: 'var(--accent-primary)'}} />
        <h3 className="text-xl font-bold" style={{color: 'var(--text-primary)'}}>Nutrition Summary</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {nutritionItems.map((item, index) => (
          <div key={index} className="text-center p-4 rounded-xl border" style={{
            background: 'var(--bg-tertiary)',
            borderColor: 'var(--border-primary)'
          }}>
            <item.icon className="w-8 h-8 mx-auto mb-2" style={{color: item.color}} />
            <div className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>{item.value}</div>
            <div className="text-sm" style={{color: 'var(--text-secondary)'}}>{item.label}</div>
          </div>
        ))}
      </div>
      
      <div className="rounded-xl p-4 border" style={{
        background: 'var(--bg-tertiary)',
        borderColor: 'var(--accent-primary)'
      }}>
        <div className="flex items-center gap-2">
          <ChartBarIcon className="w-5 h-5" style={{color: 'var(--accent-primary)'}} />
          <span className="font-semibold" style={{color: 'var(--text-primary)'}}>
            Daily Progress: {results.percentage_of_daily}% of your {results.daily_calorie_target} calorie target
          </span>
        </div>
      </div>
    </div>
  );
};

export default NutritionCard;