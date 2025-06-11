import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

const Header = () => {
  return (
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
  );
};

export default Header;