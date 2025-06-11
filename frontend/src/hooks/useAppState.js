import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const useAppState = () => {
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
      setActiveTab('dashboard');
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

  return {
    // State
    userProfile,
    ingredients,
    selectedFile,
    results,
    mealPlan,
    groceryList,
    loading,
    activeTab,
    showIngredientModal,
    
    // State setters
    setIngredients,
    setActiveTab,
    setShowIngredientModal,
    
    // Actions
    handleProfileChange,
    handleAllergyChange,
    analyzeIngredients,
    analyzePhoto,
    generateMealPlan,
    exportToPDF,
    handleFileChange
  };
};