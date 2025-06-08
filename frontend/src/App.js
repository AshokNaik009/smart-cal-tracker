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
  const [activeTab, setActiveTab] = useState('profile');

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
      setActiveTab('results');
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
      setActiveTab('meal-plan');
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
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Smart Calorie Counter
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            AI-powered nutrition tracking with cutting-edge LLMs for personalized meal planning
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <TabButton
            id="profile"
            label="Profile"
            icon={UserCircleIcon}
            isActive={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
          />
          <TabButton
            id="ingredients"
            label="Ingredients"
            icon={DocumentTextIcon}
            isActive={activeTab === 'ingredients'}
            onClick={() => setActiveTab('ingredients')}
          />
          <TabButton
            id="photo"
            label="Photo"
            icon={CameraIcon}
            isActive={activeTab === 'photo'}
            onClick={() => setActiveTab('photo')}
          />
          <TabButton
            id="results"
            label="Results"
            icon={ChartBarIcon}
            isActive={activeTab === 'results'}
            onClick={() => setActiveTab('results')}
          />
          <TabButton
            id="meal-plan"
            label="Meal Plan"
            icon={ClockIcon}
            isActive={activeTab === 'meal-plan'}
            onClick={() => setActiveTab('meal-plan')}
          />
          <TabButton
            id="grocery"
            label="Grocery List"
            icon={ShoppingBagIcon}
            isActive={activeTab === 'grocery'}
            onClick={() => setActiveTab('grocery')}
          />
        </div>

        {/* Tab Content */}
        <div className="animate-slide-up">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="glass-card p-8 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <UserCircleIcon className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Your Profile</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Age *</label>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sex</label>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Dietary Preference</label>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Health Goal</label>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Meals</label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-3">Allergies</label>
                <div className="flex flex-wrap gap-3">
                  {allergyOptions.map(allergy => (
                    <label key={allergy} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userProfile.allergies.includes(allergy)}
                        onChange={() => handleAllergyChange(allergy)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 capitalize">{allergy}</span>
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
                  {loading ? 'Generating...' : 'Generate Meal Plan'}
                </button>
              </div>
            </div>
          )}

          {/* Ingredients Tab */}
          {activeTab === 'ingredients' && (
            <div className="glass-card p-8 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Ingredient Analysis</h2>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
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
              
              <div className="flex justify-center">
                <button
                  className="btn-primary"
                  onClick={analyzeIngredients}
                  disabled={loading}
                >
                  {loading ? 'Analyzing...' : 'Analyze Ingredients'}
                </button>
              </div>
            </div>
          )}

          {/* Photo Tab */}
          {activeTab === 'photo' && (
            <div className="glass-card p-8 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <CameraIcon className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Photo Analysis</h2>
              </div>
              
              <div 
                className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-400 transition-colors duration-200 bg-gradient-to-br from-blue-50 to-purple-50"
                onClick={() => document.getElementById('file-input').click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <CameraIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-600 mb-2">
                  {selectedFile ? selectedFile.name : 'Click to select a meal photo'}
                </p>
                <p className="text-sm text-gray-500">
                  Supported formats: JPG, PNG, GIF
                </p>
              </div>
              
              <div className="mt-8 flex justify-center">
                <button
                  className="btn-primary"
                  onClick={analyzePhoto}
                  disabled={loading || !selectedFile}
                >
                  {loading ? 'Analyzing...' : 'Analyze Photo'}
                </button>
              </div>
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && results && (
            <div className="space-y-6">
              {results.identified_foods && (
                <div className="nutrition-card">
                  <div className="flex items-center gap-3 mb-4">
                    <BeakerIcon className="w-6 h-6 text-green-600" />
                    <h3 className="text-xl font-bold text-gray-800">Identified Foods</h3>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">{results.identified_foods}</pre>
                  </div>
                </div>
              )}

              <div className="nutrition-card">
                <div className="flex items-center gap-3 mb-6">
                  <ChartBarIcon className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-800">Nutrition Summary</h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  {[
                    { label: 'Calories', value: Math.round(results.nutrition?.calories || 0), icon: FireIcon, color: 'red' },
                    { label: 'Protein', value: `${Math.round(results.nutrition?.protein || 0)}g`, icon: HeartIcon, color: 'blue' },
                    { label: 'Carbs', value: `${Math.round(results.nutrition?.carbs || 0)}g`, icon: BeakerIcon, color: 'green' },
                    { label: 'Fat', value: `${Math.round(results.nutrition?.fat || 0)}g`, icon: DocumentTextIcon, color: 'yellow' },
                    { label: 'Fiber', value: `${Math.round(results.nutrition?.fiber || 0)}g`, icon: SparklesIcon, color: 'purple' }
                  ].map((item, index) => (
                    <div key={index} className="text-center p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100">
                      <item.icon className={`w-8 h-8 mx-auto mb-2 text-${item.color}-500`} />
                      <div className="text-2xl font-bold text-gray-800">{item.value}</div>
                      <div className="text-sm text-gray-600">{item.label}</div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2">
                    <ChartBarIcon className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-800">
                      Daily Progress: {results.percentage_of_daily}% of your {results.daily_calorie_target} calorie target
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Meal Plan Tab */}
          {activeTab === 'meal-plan' && mealPlan && (
            <div className="nutrition-card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <ClockIcon className="w-6 h-6 text-green-600" />
                  <h2 className="text-2xl font-bold text-gray-800">Your Daily Meal Plan</h2>
                </div>
                <button
                  className="btn-secondary flex items-center gap-2"
                  onClick={exportToPDF}
                >
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  Export PDF
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                  {mealPlan.meal_plan}
                </pre>
              </div>
            </div>
          )}

          {/* Grocery Tab */}
          {activeTab === 'grocery' && (
            <div className="nutrition-card">
              <div className="flex items-center gap-3 mb-6">
                <ShoppingBagIcon className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-800">Shopping List</h2>
              </div>
              
              {groceryList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {groceryList.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingBagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No grocery list available</p>
                  <p className="text-gray-400 text-sm">Generate a meal plan first to see your shopping list</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;