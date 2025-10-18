import React, { useState, useMemo } from 'react';
import { User, Conversation } from '../types';
import Icon from './Icon';

interface FindFriendsProps {
  onBack: () => void;
  onAddFriend: (friend: User) => void;
  existingConversations: Conversation[];
  allUsers: User[];
  currentUser: User;
}

const FindFriends: React.FC<FindFriendsProps> = ({ onBack, onAddFriend, existingConversations, allUsers, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const existingFriendsUsernames = useMemo(() => 
    new Set(existingConversations.map(c => c.user.username)),
    [existingConversations]
  );

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const lowercasedTerm = searchTerm.toLowerCase();
    
    return allUsers.filter(user => 
      user.username.toLowerCase() !== currentUser.username.toLowerCase() &&
      (user.username.toLowerCase().includes(lowercasedTerm) ||
       user.displayName.toLowerCase().includes(lowercasedTerm))
    );
  }, [searchTerm, allUsers, currentUser]);

  return (
    <div className="h-full w-full flex flex-col text-white bg-gray-900">
      <div className="p-4 border-b border-gray-700 flex items-center gap-4">
        <button onClick={onBack} className="text-gray-400 hover:text-white" aria-label="Back to messages">
          <Icon type="arrowLeft" className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-bold">Add Friends</h2>
      </div>

      <div className="p-4 border-b border-gray-700">
        <div className="relative">
          <input
            type="search"
            placeholder="Search by username or display name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon type="search" className="h-5 w-5"/>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {searchTerm.trim() && searchResults.length === 0 && (
          <div className="text-center text-gray-400 pt-10">
            <p>No users found for "{searchTerm}"</p>
          </div>
        )}
        {searchResults.length > 0 && (
          <ul className="space-y-3">
            {searchResults.map(user => (
              <li key={user.username} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <img src={user.avatar} alt={user.displayName} className="h-10 w-10 rounded-full" />
                  <div>
                    <p className="font-bold">{user.displayName}</p>
                    <p className="text-sm text-gray-400">@{user.username}</p>
                  </div>
                </div>
                <button 
                  onClick={() => onAddFriend(user)}
                  disabled={existingFriendsUsernames.has(user.username)}
                  className="bg-pink-600 text-white px-4 py-1.5 rounded-md text-sm font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-pink-700 transition-colors"
                >
                  {existingFriendsUsernames.has(user.username) ? 'Added' : 'Add'}
                </button>
              </li>
            ))}
          </ul>
        )}
         {!searchTerm.trim() && (
            <div className="text-center text-gray-400 pt-10">
                <p>Start typing to find your friends.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default FindFriends;