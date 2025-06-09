import React, { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import {
  CameraIcon,
  DocumentTextIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  ChartBarIcon,
  ClockIcon,
  FireIcon,
  BeakerIcon,
  HeartIcon,
  DocumentArrowDownIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [userProfile, setUserProfile] = useState({
    age: '',
    sex: 'male',
    dietary_preference: 'omnivore',
    allergies: [],
    health_goal: 'maintain',
    num_meals: 3
  });

  const [ingredients, setIngredients] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [results, setResults] = useState(null);
  const [mealPlan, setMealPlan] = useState(null);
  const [groceryList, setGroceryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('scan');
  const [showIngredientModal, setShowIngredientModal] = useState(false);

  const allergyOptions = [
    'nuts', 'dairy', 'gluten', 'shellfish', 'eggs', 'soy', 'fish'
  ];

  const handleProfileChange = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAllergyChange = (allergy) => {
    setUserProfile(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter(a => a !== allergy)
        : [...prev.allergies, allergy]
    }));
  };

  const analyzeIngredients = async () => {
    if (!ingredients.trim() || !userProfile.age) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    toast.loading('Analyzing ingredients...', { id: 'analyze' });

    try {
      const ingredientList = ingredients.split('\n').filter(ing => ing.trim());
      const response = await axios.post(`${API_BASE_URL}/analyze-ingredients`, {
        user_profile: {
          ...userProfile,
          age: parseInt(userProfile.age)
        },
        ingredients: ingredientList
      });

      setResults(response.data);
      toast.success('Analysis complete!', { id: 'analyze' });
      setActiveTab('results');
    } catch (err) {
      toast.error('Failed to analyze ingredients', { id: 'analyze' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const analyzePhoto = async () => {
    if (!selectedFile || !userProfile.age) {
      toast.error('Please select a photo and fill in your profile');
      return;
    }

    setLoading(true);
    toast.loading('Analyzing photo...', { id: 'photo' });

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('user_profile', JSON.stringify({
        ...userProfile,
        age: parseInt(userProfile.age)
      }));

      const response = await axios.post(`${API_BASE_URL}/analyze-photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResults(response.data);
      toast.success('Photo analyzed successfully!', { id: 'photo' });
      setActiveTab('dashboard');
    } catch (err) {
      toast.error('Failed to analyze photo', { id: 'photo' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateMealPlan = async () => {
    if (!userProfile.age) {
      toast.error('Please fill in your profile first');
      return;
    }

    setLoading(true);
    toast.loading('Generating meal plan...', { id: 'meal-plan' });

    try {
      const response = await axios.post(`${API_BASE_URL}/generate-meal-plan`, {
        ...userProfile,
        age: parseInt(userProfile.age)
      });

      setMealPlan(response.data);
      
      // Extract grocery list from meal plan
      const groceryItems = extractGroceryList(response.data.meal_plan);
      setGroceryList(groceryItems);
      
      toast.success('Meal plan generated!', { id: 'meal-plan' });
      setActiveTab('dashboard');
    } catch (err) {
      toast.error('Failed to generate meal plan', { id: 'meal-plan' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const extractGroceryList = (mealPlanText) => {
    // Simple extraction logic - can be improved with better parsing
    const items = [];
    const lines = mealPlanText.split('\n');
    
    lines.forEach(line => {
      if (line.includes('ingredient') || line.includes('-') && !line.includes(':')) {
        const cleaned = line.replace(/^[-\s*]+/, '').trim();
        if (cleaned && cleaned.length > 2) {
          items.push(cleaned);
        }
      }
    });
    
    return [...new Set(items)]; // Remove duplicates
  };

  const exportToPDF = async () => {
    if (!mealPlan) {
      toast.error('Generate a meal plan first');
      return;
    }

    toast.loading('Generating PDF...', { id: 'pdf' });

    try {
      const response = await axios.post(`${API_BASE_URL}/export-pdf`, mealPlan, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'meal_plan.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('PDF downloaded!', { id: 'pdf' });
    } catch (err) {
      toast.error('Failed to export PDF', { id: 'pdf' });
      console.error(err);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      toast.success('Image selected successfully!');
    } else {
      toast.error('Please select a valid image file');
    }
  };

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      className={`tab-button ${isActive ? 'tab-active' : 'tab-inactive'} flex items-center gap-2`}
      onClick={onClick}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen py-8 px-4">
      <Toaster position="top-right" />
      
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center section-spacing animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl" style={{
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)'
            }}>
              <SparklesIcon className="w-8 h-8" style={{color: 'var(--text-primary)'}} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold" style={{
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Smart Calorie Counter
            </h1>
          </div>
          <p className="text-large text-medium-contrast max-w-2xl mx-auto" style={{color: 'var(--text-secondary)'}}>
            AI-powered nutrition tracking with cutting-edge LLMs for personalized meal planning
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-3 section-spacing">
          <TabButton
            id="scan"
            label="Scan to Find Calories"
            icon={CameraIcon}
            isActive={activeTab === 'scan'}
            onClick={() => setActiveTab('scan')}
          />
          <TabButton
            id="dashboard"
            label="Dashboard"
            icon={ChartBarIcon}
            isActive={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
          />
          <TabButton
            id="grocery-guide"
            label="Grocery Guide"
            icon={ShoppingBagIcon}
            isActive={activeTab === 'grocery-guide'}
            onClick={() => setActiveTab('grocery-guide')}
          />
          <TabButton
            id="profile"
            label="Profile Setup"
            icon={UserCircleIcon}
            isActive={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
          />
        </div>

        {/* Tab Content */}
        <div className="animate-slide-up">
          {/* Scan to Find Calories Tab */}
          {activeTab === 'scan' && (
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

                      <div className="nutrition-card">
                        <div className="flex items-center gap-3 mb-6">
                          <ChartBarIcon className="w-6 h-6" style={{color: 'var(--accent-primary)'}} />
                          <h3 className="text-xl font-bold" style={{color: 'var(--text-primary)'}}>Nutrition Summary</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                          {[
                            { label: 'Calories', value: Math.round(results.nutrition?.calories || 0), icon: FireIcon, color: 'var(--accent-tertiary)' },
                            { label: 'Protein', value: `${Math.round(results.nutrition?.protein || 0)}g`, icon: HeartIcon, color: 'var(--accent-primary)' },
                            { label: 'Carbs', value: `${Math.round(results.nutrition?.carbs || 0)}g`, icon: BeakerIcon, color: 'var(--accent-secondary)' },
                            { label: 'Fat', value: `${Math.round(results.nutrition?.fat || 0)}g`, icon: DocumentTextIcon, color: 'var(--accent-tertiary)' },
                            { label: 'Fiber', value: `${Math.round(results.nutrition?.fiber || 0)}g`, icon: SparklesIcon, color: 'var(--accent-primary)' }
                          ].map((item, index) => (
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
          )}

          {/* Profile Setup Tab */}
          {activeTab === 'profile' && (
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
          )}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
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

                  <div className="nutrition-card">
                    <div className="flex items-center gap-3 mb-6">
                      <ChartBarIcon className="w-6 h-6" style={{color: 'var(--accent-primary)'}} />
                      <h3 className="text-xl font-bold" style={{color: 'var(--text-primary)'}}>Nutrition Summary</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                      {[
                        { label: 'Calories', value: Math.round(results.nutrition?.calories || 0), icon: FireIcon, color: 'var(--accent-tertiary)' },
                        { label: 'Protein', value: `${Math.round(results.nutrition?.protein || 0)}g`, icon: HeartIcon, color: 'var(--accent-primary)' },
                        { label: 'Carbs', value: `${Math.round(results.nutrition?.carbs || 0)}g`, icon: BeakerIcon, color: 'var(--accent-secondary)' },
                        { label: 'Fat', value: `${Math.round(results.nutrition?.fat || 0)}g`, icon: DocumentTextIcon, color: 'var(--accent-tertiary)' },
                        { label: 'Fiber', value: `${Math.round(results.nutrition?.fiber || 0)}g`, icon: SparklesIcon, color: 'var(--accent-primary)' }
                      ].map((item, index) => (
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
          )}

          {/* Grocery Guide Tab */}
          {activeTab === 'grocery-guide' && (
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
                        {userProfile.dietary_preference === 'vegan' ? [
                          'Tofu & Tempeh',
                          'Lentils & Legumes',
                          'Quinoa',
                          'Plant-based protein powder',
                          'Nuts & Seeds'
                        ] : userProfile.dietary_preference === 'vegetarian' ? [
                          'Greek yogurt',
                          'Eggs',
                          'Cottage cheese',
                          'Tofu & Tempeh',
                          'Lentils & Beans'
                        ] : [
                          'Lean chicken breast',
                          'Wild salmon',
                          'Greek yogurt',
                          'Eggs',
                          'Lean ground turkey'
                        ]}
                        {(userProfile.dietary_preference === 'vegan' ? [
                          'Tofu & Tempeh',
                          'Lentils & Legumes',
                          'Quinoa',
                          'Plant-based protein powder',
                          'Nuts & Seeds'
                        ] : userProfile.dietary_preference === 'vegetarian' ? [
                          'Greek yogurt',
                          'Eggs',
                          'Cottage cheese',
                          'Tofu & Tempeh',
                          'Lentils & Beans'
                        ] : [
                          'Lean chicken breast',
                          'Wild salmon',
                          'Greek yogurt',
                          'Eggs',
                          'Lean ground turkey'
                        ]).map((item, index) => (
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
                          {userProfile.health_goal === 'weight_loss' ? [
                            'High-fiber vegetables',
                            'Lean proteins',
                            'Complex carbohydrates',
                            'Low-calorie density foods'
                          ] : userProfile.health_goal === 'weight_gain' ? [
                            'Calorie-dense nuts',
                            'Healthy oils',
                            'Protein-rich foods',
                            'Whole grain carbs'
                          ] : userProfile.health_goal === 'muscle_gain' ? [
                            'High-quality proteins',
                            'Post-workout carbs',
                            'Creatine-rich foods',
                            'Recovery nutrients'
                          ] : [
                            'Balanced macronutrients',
                            'Variety of colors',
                            'Whole foods',
                            'Consistent portions'
                          ]}
                          {(userProfile.health_goal === 'weight_loss' ? [
                            'High-fiber vegetables',
                            'Lean proteins',
                            'Complex carbohydrates',
                            'Low-calorie density foods'
                          ] : userProfile.health_goal === 'weight_gain' ? [
                            'Calorie-dense nuts',
                            'Healthy oils',
                            'Protein-rich foods',
                            'Whole grain carbs'
                          ] : userProfile.health_goal === 'muscle_gain' ? [
                            'High-quality proteins',
                            'Post-workout carbs',
                            'Creatine-rich foods',
                            'Recovery nutrients'
                          ] : [
                            'Balanced macronutrients',
                            'Variety of colors',
                            'Whole foods',
                            'Consistent portions'
                          ]).map((item, index) => (
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
          )}
        </div>
        
        {/* Ingredient Analysis Modal */}
        {showIngredientModal && (
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
        )}
      </div>
    </div>
  );
}

export default App;