import React from 'react';
import { User, Video, Conversation } from '../types';
import Icon from './Icon';

interface ProfileViewProps {
  user: User;
  onLogout: () => void;
  videos: Video[];
  conversations: Conversation[];
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout, videos, conversations }) => {
  
  const userVideos = videos.filter(video => video.user.username === user.username);
  const totalViews = userVideos.reduce((sum, video) => sum + (video.views || 0), 0);
  const totalLikes = userVideos.reduce((sum, video) => sum + video.likes, 0);

  const handleExportData = () => {
    // Explicitly exclude passwordHash from the export
    const { passwordHash, ...safeProfile } = user;

    const exportData = {
        profile: safeProfile,
        videos: userVideos.map(v => ({
            src: v.src,
            caption: v.caption,
            audioName: v.audioName,
            likes: v.likes,
            comments: v.comments,
            shares: v.shares,
            views: v.views,
        })),
        conversations: conversations.map(c => ({
            withUser: {
                username: c.user.username,
                displayName: c.user.displayName,
            },
            messages: c.messages.map(m => ({
                sender: m.sender,
                text: m.text,
                timestamp: m.timestamp,
            }))
        })),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `reeltalk_data_${user.username}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-900 text-white overflow-y-auto">
        <div className="p-4 text-center">
            <img src={user.avatar} alt={user.displayName} className="h-24 w-24 rounded-full mx-auto mb-4 border-4 border-pink-500"/>
            <h1 className="text-2xl font-bold">{user.displayName}</h1>
            <p className="text-gray-400">@{user.username}</p>
        </div>

        <div className="flex items-center justify-around w-full max-w-md mx-auto my-4 text-center">
            <div>
                <p className="font-bold text-xl">{user.following.toLocaleString()}</p>
                <p className="text-sm text-gray-400">Following</p>
            </div>
            <div>
                <p className="font-bold text-xl">{user.followers.toLocaleString()}</p>
                <p className="text-sm text-gray-400">Followers</p>
            </div>
            <div>
                <p className="font-bold text-xl">{totalLikes.toLocaleString()}</p>
                <p className="text-sm text-gray-400">Likes</p>
            </div>
        </div>

        <div className="w-full max-w-md mx-auto p-4">
           <div className="bg-gray-800 p-4 rounded-lg text-center">
                <h2 className="text-lg font-bold mb-2">Creator Analytics</h2>
                <p className="text-gray-400">Total Video Views: <span className="font-bold text-white">{totalViews.toLocaleString()}</span></p>
            </div>
        </div>
        
        <div className="w-full px-2 mt-4">
          <h3 className="text-lg font-bold text-center mb-2">My Videos</h3>
          <div className="grid grid-cols-3 gap-1">
            {userVideos.map(video => (
              <div key={video.id} className="relative aspect-video bg-gray-800">
                <video src={video.src} className="h-full w-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/50 text-white text-xs flex items-center gap-1">
                  <Icon type='play' className="h-3 w-3" />
                  <span>{(video.views || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>


        <div className="w-full max-w-md mx-auto p-4 mt-auto">
            <button 
                onClick={handleExportData}
                className="w-full mt-4 bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-lg transition-colors"
            >
                Download My Data
            </button>

            <button 
                onClick={onLogout}
                className="w-full mt-4 bg-gray-700 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-colors"
            >
                Log Out
            </button>
        </div>
    </div>
  );
};

export default ProfileView;