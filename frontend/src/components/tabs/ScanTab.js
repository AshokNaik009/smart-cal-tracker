import React from 'react';
import {
  CameraIcon,
  UserCircleIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import NutritionCard from '../ui/NutritionCard';

const ScanTab = ({ 
  userProfile, 
  selectedFile, 
  handleFileChange, 
  analyzePhoto, 
  loading, 
  results,
  setActiveTab,
  setShowIngredientModal
}) => {
  return (
    <div className="space-y-8">
      {/* Check if profile is complete */}
      {!userProfile.age ? (
        <div className="glass-card text-center card-spacing">
          <div className="flex items-center justify-center gap-3 mb-6">
            <UserCircleIcon className="w-8 h-8" style={{color: 'var(--accent-primary)'}} />
            <h2 className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>Complete Your Profile First</h2>
          </div>
          <p className="text-lg mb-6" style={{color: 'var(--text-secondary)'}}>
            To get personalized calorie analysis, please set up your profile first.
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
          {/* Photo Scanner */}
          <div className="glass-card card-spacing">
            <div className="flex items-center gap-3 mb-6">
              <CameraIcon className="w-6 h-6" style={{color: 'var(--accent-primary)'}} />
              <h2 className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>Scan Your Food</h2>
            </div>
            
            <div 
              className="border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300"
              style={{
                borderColor: 'var(--border-primary)',
                background: 'var(--bg-tertiary)'
              }}
              onClick={() => document.getElementById('file-input').click()}
            >
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <CameraIcon className="w-16 h-16 mx-auto mb-4" style={{color: 'var(--text-tertiary)'}} />
              <p className="text-lg font-semibold mb-2" style={{color: 'var(--text-primary)'}}>
                {selectedFile ? selectedFile.name : 'Click to select a meal photo'}
              </p>
              <p className="text-sm" style={{color: 'var(--text-secondary)'}}>
                Supported formats: JPG, PNG, GIF
              </p>
            </div>
            
            <div className="mt-8 flex justify-center">
              <button
                className="btn-primary"
                onClick={analyzePhoto}
                disabled={loading || !selectedFile}
              >
                {loading ? 'Analyzing...' : 'Scan Food'}
              </button>
            </div>
          </div>

          {/* Inline Results */}
          {results && (
            <div className="space-y-8">
              {results.identified_foods && (
                <div className="nutrition-card">
                  <div className="flex items-center gap-3 mb-4">
                    <BeakerIcon className="w-6 h-6" style={{color: 'var(--accent-secondary)'}} />
                    <h3 className="text-xl font-bold" style={{color: 'var(--text-primary)'}}>Identified Foods</h3>
                  </div>
                  <div className="rounded-xl p-4" style={{background: 'var(--bg-tertiary)'}}>
                    <pre className="whitespace-pre-wrap text-sm" style={{color: 'var(--text-secondary)'}}>{results.identified_foods}</pre>
                  </div>
                </div>
              )}

              <NutritionCard results={results} />

              {/* Action CTAs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Grocery Guide CTA */}
                <div className="glass-card p-6 rounded-3xl text-center">
                  <h3 className="text-xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>
                    Want to know how your grocery should be?
                  </h3>
                  <p className="mb-6" style={{color: 'var(--text-secondary)'}}>
                    Get personalized shopping recommendations based on your nutrition goals
                  </p>
                  <button
                    className="btn-primary"
                    onClick={() => setActiveTab('grocery-guide')}
                  >
                    View Grocery Guide
                  </button>
                </div>

                {/* Ingredient Analysis CTA */}
                <div className="glass-card p-6 rounded-3xl text-center">
                  <h3 className="text-xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>
                    Want to try ingredient analysis?
                  </h3>
                  <p className="mb-6" style={{color: 'var(--text-secondary)'}}>
                    Manually analyze nutrition by entering ingredients instead of scanning
                  </p>
                  <button
                    className="btn-secondary"
                    onClick={() => setShowIngredientModal(true)}
                  >
                    Try Ingredient Analysis
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScanTab;