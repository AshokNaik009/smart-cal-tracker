import React from 'react';

const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
  <button
    className={`tab-button ${isActive ? 'tab-active' : 'tab-inactive'} flex items-center gap-2`}
    onClick={onClick}
  >
    <Icon className="w-5 h-5" />
    {label}
  </button>
);

export default TabButton;