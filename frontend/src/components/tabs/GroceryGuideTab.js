import React from 'react';
import {
  ShoppingBagIcon,
  HeartIcon,
  BeakerIcon,
  SparklesIcon,
  DocumentTextIcon,
  FireIcon
} from '@heroicons/react/24/outline';

const GroceryGuideTab = ({ userProfile, groceryList, setActiveTab }) => {
  const getProteinOptions = (dietary_preference) => {
    switch (dietary_preference) {
      case 'vegan':
        return [
          'Tofu & Tempeh',
          'Lentils & Legumes',
          'Quinoa',
          'Plant-based protein powder',
          'Nuts & Seeds'
        ];
      case 'vegetarian':
        return [
          'Greek yogurt',
          'Eggs',
          'Cottage cheese',
          'Tofu & Tempeh',
          'Lentils & Beans'
        ];
      default:
        return [
          'Lean chicken breast',
          'Wild salmon',
          'Greek yogurt',
          'Eggs',
          'Lean ground turkey'
        ];
    }
  };

  const getHealthGoalRecommendations = (health_goal) => {
    switch (health_goal) {
      case 'weight_loss':
        return [
          'High-fiber vegetables',
          'Lean proteins',
          'Complex carbohydrates',
          'Low-calorie density foods'
        ];
      case 'weight_gain':
        return [
          'Calorie-dense nuts',
          'Healthy oils',
          'Protein-rich foods',
          'Whole grain carbs'
        ];
      case 'muscle_gain':
        return [
          'High-quality proteins',
          'Post-workout carbs',
          'Creatine-rich foods',
          'Recovery nutrients'
        ];
      default:
        return [
          'Balanced macronutrients',
          'Variety of colors',
          'Whole foods',
          'Consistent portions'
        ];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-8 rounded-3xl text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <ShoppingBagIcon className="w-8 h-8" style={{color: 'var(--accent-primary)'}} />
          <h2 className="text-3xl font-bold" style={{color: 'var(--text-primary)'}}>Smart Grocery Guide</h2>
        </div>
        <p className="text-lg" style={{color: 'var(--text-secondary)'}}>
          Personalized shopping recommendations based on your nutrition goals and dietary preferences
        </p>
      </div>

      {!userProfile.age ? (
        <div className="glass-card p-8 rounded-3xl text-center">
          <h3 className="text-xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>
            Complete Your Profile First
          </h3>
          <p className="mb-6" style={{color: 'var(--text-secondary)'}}>
            To get personalized grocery recommendations, please set up your profile.
          </p>
          <button
            className="btn-primary"
            onClick={() => setActiveTab('profile')}
          >
            Set Up Profile
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Smart Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Proteins */}
            <div className="glass-card p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-4">
                <HeartIcon className="w-6 h-6" style={{color: 'var(--accent-primary)'}} />
                <h3 className="text-xl font-bold" style={{color: 'var(--text-primary)'}}>Proteins</h3>
              </div>
              <div className="space-y-3">
                {getProteinOptions(userProfile.dietary_preference).map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg" style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-primary)'
                  }}>
                    <div className="w-2 h-2 rounded-full" style={{background: 'var(--accent-primary)'}}></div>
                    <span style={{color: 'var(--text-primary)'}}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vegetables */}
            <div className="glass-card p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-4">
                <BeakerIcon className="w-6 h-6" style={{color: 'var(--accent-secondary)'}} />
                <h3 className="text-xl font-bold" style={{color: 'var(--text-primary)'}}>Vegetables</h3>
              </div>
              <div className="space-y-3">
                {[
                  'Leafy greens (spinach, kale)',
                  'Bell peppers',
                  'Broccoli & cauliflower',
                  'Sweet potatoes',
                  'Zucchini & squash'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg" style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-primary)'
                  }}>
                    <div className="w-2 h-2 rounded-full" style={{background: 'var(--accent-secondary)'}}></div>
                    <span style={{color: 'var(--text-primary)'}}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Healthy Fats */}
            <div className="glass-card p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-4">
                <SparklesIcon className="w-6 h-6" style={{color: 'var(--accent-tertiary)'}} />
                <h3 className="text-xl font-bold" style={{color: 'var(--text-primary)'}}>Healthy Fats</h3>
              </div>
              <div className="space-y-3">
                {[
                  'Avocados',
                  'Extra virgin olive oil',
                  'Nuts & seeds',
                  'Fatty fish (salmon, sardines)',
                  'Coconut oil'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg" style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-primary)'
                  }}>
                    <div className="w-2 h-2 rounded-full" style={{background: 'var(--accent-tertiary)'}}></div>
                    <span style={{color: 'var(--text-primary)'}}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Generated Shopping List */}
          {groceryList.length > 0 && (
            <div className="glass-card p-8 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <DocumentTextIcon className="w-6 h-6" style={{color: 'var(--accent-primary)'}} />
                <h3 className="text-xl font-bold" style={{color: 'var(--text-primary)'}}>Your Meal Plan Shopping List</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {groceryList.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:scale-105" style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-primary)'
                  }}>
                    <div className="w-2 h-2 rounded-full" style={{background: 'var(--accent-primary)'}}></div>
                    <span style={{color: 'var(--text-primary)'}}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Health Goals Recommendations */}
          <div className="glass-card p-8 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <FireIcon className="w-6 h-6" style={{color: 'var(--accent-primary)'}} />
              <h3 className="text-xl font-bold" style={{color: 'var(--text-primary)'}}>
                Recommendations for {userProfile.health_goal.replace('_', ' ')}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl" style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)'
              }}>
                <h4 className="font-semibold mb-3" style={{color: 'var(--text-primary)'}}>Prioritize:</h4>
                <ul className="space-y-2">
                  {getHealthGoalRecommendations(userProfile.health_goal).map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{background: 'var(--accent-primary)'}}></div>
                      <span style={{color: 'var(--text-secondary)'}}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-4 rounded-xl" style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)'
              }}>
                <h4 className="font-semibold mb-3" style={{color: 'var(--text-primary)'}}>Limit:</h4>
                <ul className="space-y-2">
                  {[
                    'Processed foods',
                    'Added sugars',
                    'Trans fats',
                    'Excessive sodium'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{background: 'var(--accent-tertiary)'}}></div>
                      <span style={{color: 'var(--text-secondary)'}}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroceryGuideTab;