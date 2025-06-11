import React from 'react';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const ProfileTab = ({ 
  userProfile, 
  handleProfileChange, 
  handleAllergyChange, 
  generateMealPlan, 
  loading 
}) => {
  const allergyOptions = [
    'nuts', 'dairy', 'gluten', 'shellfish', 'eggs', 'soy', 'fish'
  ];

  return (
    <div className="glass-card p-8 rounded-3xl">
      <div className="flex items-center gap-3 mb-6">
        <UserCircleIcon className="w-6 h-6" style={{color: 'var(--accent-primary)'}} />
        <h2 className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>Your Profile</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{color: 'var(--text-primary)'}}>Age *</label>
          <input
            type="number"
            value={userProfile.age}
            onChange={(e) => handleProfileChange('age', e.target.value)}
            placeholder="Enter your age"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{color: 'var(--text-primary)'}}>Sex</label>
          <select
            value={userProfile.sex}
            onChange={(e) => handleProfileChange('sex', e.target.value)}
            className="input-field"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{color: 'var(--text-primary)'}}>Dietary Preference</label>
          <select
            value={userProfile.dietary_preference}
            onChange={(e) => handleProfileChange('dietary_preference', e.target.value)}
            className="input-field"
          >
            <option value="omnivore">Omnivore</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="keto">Keto</option>
            <option value="paleo">Paleo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{color: 'var(--text-primary)'}}>Health Goal</label>
          <select
            value={userProfile.health_goal}
            onChange={(e) => handleProfileChange('health_goal', e.target.value)}
            className="input-field"
          >
            <option value="weight_loss">Weight Loss</option>
            <option value="maintain">Maintain Weight</option>
            <option value="weight_gain">Weight Gain</option>
            <option value="muscle_gain">Muscle Gain</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{color: 'var(--text-primary)'}}>Number of Meals</label>
          <input
            type="number"
            min="2"
            max="6"
            value={userProfile.num_meals}
            onChange={(e) => handleProfileChange('num_meals', parseInt(e.target.value))}
            className="input-field"
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-semibold mb-3" style={{color: 'var(--text-primary)'}}>Allergies</label>
        <div className="flex flex-wrap gap-3">
          {allergyOptions.map(allergy => (
            <label key={allergy} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={userProfile.allergies.includes(allergy)}
                onChange={() => handleAllergyChange(allergy)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium capitalize" style={{color: 'var(--text-primary)'}}>{allergy}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          className="btn-primary"
          onClick={generateMealPlan}
          disabled={loading || !userProfile.age}
        >
          {loading ? (
            <>
              <div className="skeleton w-4 h-4 rounded-full mr-2"></div>
              Generating Plan...
            </>
          ) : 'Generate Meal Plan'}
        </button>
      </div>
    </div>
  );
};

export default ProfileTab;