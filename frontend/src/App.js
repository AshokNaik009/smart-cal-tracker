import React from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  CameraIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

// Components
import Header from './components/layout/Header';
import TabButton from './components/ui/TabButton';
import ScanTab from './components/tabs/ScanTab';
import ProfileTab from './components/tabs/ProfileTab';
import DashboardTab from './components/tabs/DashboardTab';
import GroceryGuideTab from './components/tabs/GroceryGuideTab';
import IngredientModal from './components/ui/IngredientModal';

// Custom hook
import { useAppState } from './hooks/useAppState';

function App() {
  const {
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
  } = useAppState();

  return (
    <div className="min-h-screen py-8 px-4">
      <Toaster position="top-right" />
      
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <Header />

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
            <ScanTab 
              userProfile={userProfile}
              selectedFile={selectedFile}
              handleFileChange={handleFileChange}
              analyzePhoto={analyzePhoto}
              loading={loading}
              results={results}
              setActiveTab={setActiveTab}
              setShowIngredientModal={setShowIngredientModal}
            />
          )}

          {/* Profile Setup Tab */}
          {activeTab === 'profile' && (
            <ProfileTab 
              userProfile={userProfile}
              handleProfileChange={handleProfileChange}
              handleAllergyChange={handleAllergyChange}
              generateMealPlan={generateMealPlan}
              loading={loading}
            />
          )}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <DashboardTab 
              userProfile={userProfile}
              generateMealPlan={generateMealPlan}
              loading={loading}
              mealPlan={mealPlan}
              exportToPDF={exportToPDF}
              results={results}
              setShowIngredientModal={setShowIngredientModal}
            />
          )}

          {/* Grocery Guide Tab */}
          {activeTab === 'grocery-guide' && (
            <GroceryGuideTab 
              userProfile={userProfile}
              groceryList={groceryList}
              setActiveTab={setActiveTab}
            />
          )}
        </div>
        
        {/* Ingredient Analysis Modal */}
        <IngredientModal 
          showIngredientModal={showIngredientModal}
          setShowIngredientModal={setShowIngredientModal}
          ingredients={ingredients}
          setIngredients={setIngredients}
          analyzeIngredients={analyzeIngredients}
          loading={loading}
          userProfile={userProfile}
        />
      </div>
    </div>
  );
}

export default App;