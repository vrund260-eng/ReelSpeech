import React from 'react';
import Icon from './Icon';

type View = 'home' | 'create' | 'chat' | 'profile';

interface BottomNavProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView }) => {
  const navItems = [
    { name: 'home', label: 'Home', icon: 'home' },
    { name: 'create', label: 'Create', icon: 'create' },
    { name: 'chat', label: 'Inbox', icon: 'chat' },
    { name: 'profile', label: 'Profile', icon: 'profile' },
  ] as const;

  return (
    <nav className="bg-black border-t border-gray-700 text-white">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setCurrentView(item.name)}
            className={`flex flex-col items-center justify-center w-full h-full text-xs gap-1 ${
              currentView === item.name ? 'text-pink-500' : 'text-gray-400'
            }`}
          >
            <Icon type={item.icon} className="h-6 w-6" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;