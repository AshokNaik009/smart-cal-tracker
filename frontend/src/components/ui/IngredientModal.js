import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const IngredientModal = ({ 
  showIngredientModal, 
  setShowIngredientModal, 
  ingredients, 
  setIngredients, 
  analyzeIngredients, 
  loading, 
  userProfile 
}) => {
  if (!showIngredientModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <DocumentTextIcon className="w-6 h-6" style={{color: 'var(--accent-secondary)'}} />
            <h3 className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>Ingredient Analysis</h3>
          </div>
          <button
            onClick={() => setShowIngredientModal(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{color: 'var(--text-secondary)'}}
          >
            ✕
          </button>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-3" style={{color: 'var(--text-primary)'}}>
            Ingredients (one per line)
          </label>
          <textarea
            rows="8"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="chicken breast&#10;brown rice&#10;broccoli&#10;olive oil&#10;garlic"
            className="input-field resize-none"
          />
        </div>
        
        <div className="flex gap-4">
          <button
            className="btn-primary flex-1"
            onClick={() => {
              analyzeIngredients();
              setShowIngredientModal(false);
            }}
            disabled={loading || !userProfile.age}
          >
            {loading ? 'Analyzing...' : 'Analyze Ingredients'}
          </button>
          <button
            className="btn-secondary"
            onClick={() => setShowIngredientModal(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default IngredientModal;