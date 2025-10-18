import React from 'react';
import { User } from '../types';

interface ProfileViewProps {
  user: User;
  onLogout: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout }) => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-gray-900 text-white p-4">
        <div className="text-center">
            <img src={user.avatar} alt={user.displayName} className="h-24 w-24 rounded-full mx-auto mb-4 border-4 border-pink-500"/>
            <h1 className="text-2xl font-bold">{user.displayName}</h1>
            <p className="text-gray-400">@{user.username}</p>
        </div>

        <div className="w-full max-w-sm mt-8 space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Email</p>
                <p>{user.email}</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Phone</p>
                <p>{user.phone || 'Not provided'}</p>
            </div>
        </div>

        <button 
            onClick={onLogout}
            className="w-full max-w-sm mt-8 bg-gray-700 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-colors"
        >
            Log Out
        </button>
    </div>
  );
};

export default ProfileView;