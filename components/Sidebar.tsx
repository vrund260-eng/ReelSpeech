import React from 'react';
import { Video } from '../types';
import Icon from './Icon';

interface SidebarProps {
  video: Video;
  isMuted: boolean;
  isLiked: boolean;
  onMuteToggle: (e: React.MouseEvent) => void;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ video, isMuted, isLiked, onMuteToggle, onLike, onComment, onShare }) => {
  return (
    <div className="flex flex-col items-center justify-end gap-5 text-white p-2">
       <button onClick={onLike} className="flex flex-col items-center gap-1">
        <div className={`bg-white/20 p-3 rounded-full transition-colors ${isLiked ? 'text-pink-500' : ''}`}>
         <Icon type="heart" className="h-8 w-8" />
        </div>
        <span className="text-sm font-semibold">{video.likes.toLocaleString()}</span>
      </button>

      <button onClick={onComment} className="flex flex-col items-center gap-1">
        <div className="bg-white/20 p-3 rounded-full">
          <Icon type="comment" className="h-8 w-8" />
        </div>
        <span className="text-sm font-semibold">{video.comments.toLocaleString()}</span>
      </button>

      <button onClick={onShare} className="flex flex-col items-center gap-1">
        <div className="bg-white/20 p-3 rounded-full">
            <Icon type="share" className="h-8 w-8" />
        </div>
        <span className="text-sm font-semibold">{video.shares.toLocaleString()}</span>
      </button>
      
      <button onClick={onMuteToggle} className="flex flex-col items-center gap-1">
        <div className="bg-white/20 p-3 rounded-full">
            <Icon type={isMuted ? 'volumeOff' : 'volumeUp'} className="h-8 w-8" />
        </div>
      </button>

       <div className="mt-4">
        <img 
          src={video.user.avatar} 
          alt="audio" 
          className="h-12 w-12 rounded-full border-2 border-gray-700 animate-spin"
          style={{animationDuration: '5s'}}
        />
      </div>
    </div>
  );
};

export default Sidebar;