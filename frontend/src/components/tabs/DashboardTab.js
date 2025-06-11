import React from 'react';
import {
  ChartBarIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import NutritionCard from '../ui/NutritionCard';

const DashboardTab = ({ 
  userProfile,
  generateMealPlan,
  loading,
  mealPlan,
  exportToPDF,
  results,
  setShowIngredientModal
}) => {
  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="glass-card p-8 rounded-3xl text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <ChartBarIcon className="w-8 h-8" style={{color: 'var(--accent-primary)'}} />
          <h2 className="text-3xl font-bold" style={{color: 'var(--text-primary)'}}>Your Nutrition Dashboard</h2>
        </div>
        <p className="text-lg" style={{color: 'var(--text-secondary)'}}>
          Track your meals, analyze ingredients, and manage your meal plans
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6">
        {/* Meal Planning */}
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-4">
            <ClockIcon className="w-6 h-6" style={{color: 'var(--accent-tertiary)'}} />
            <h3 className="text-xl font-bold" style={{color: 'var(--text-primary)'}}>Meal Planning</h3>
          </div>
          
          <p className="mb-4" style={{color: 'var(--text-secondary)'}}>
            Generate personalized meal plans based on your profile and dietary preferences.
          </p>
          
          <button
            className="btn-primary w-full"
            onClick={generateMealPlan}
            disabled={loading || !userProfile.age}
          >
            {loading ? 'Generating...' : 'Generate Meal Plan'}
          </button>

          {mealPlan && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold" style={{color: 'var(--text-primary)'}}>Latest Meal Plan</span>
                <button
                  className="btn-secondary text-xs py-1 px-3"
                  onClick={exportToPDF}
                >
                  <DocumentArrowDownIcon className="w-4 h-4 inline mr-1" />
                  Export PDF
                </button>
              </div>
              <div className="rounded-lg p-3 text-xs max-h-32 overflow-y-auto" style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)'
              }}>
                {mealPlan.meal_plan.substring(0, 200)}...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Display */}
      {results && (
        <div className="space-y-6">
          {results.identified_foods && (
            <div className="nutrition-card">
              <div className="flex items-center gap-3 mb-4">
                <BeakerIcon className="w-6 h-6" style={{color: 'var(--accent-secondary)'}} />
                <h3 className="text-xl font-bold" style={{color: 'var(--text-primary)'}}>Analysis Results</h3>
              </div>
              <div className="rounded-xl p-4" style={{background: 'var(--bg-tertiary)'}}>
                <pre className="whitespace-pre-wrap text-sm" style={{color: 'var(--text-secondary)'}}>{results.identified_foods}</pre>
              </div>
            </div>
          )}

          <NutritionCard results={results} />

          {/* CTA for Ingredient Analysis */}
          <div className="glass-card p-6 rounded-3xl text-center">
            <h3 className="text-xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>
              Want to try ingredient analysis instead?
            </h3>
            <p className="mb-4" style={{color: 'var(--text-secondary)'}}>
              Manually analyze nutrition by entering ingredients
            </p>
            <button
              className="btn-secondary"
              onClick={() => setShowIngredientModal(true)}
            >
              Try Ingredient Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardTab;