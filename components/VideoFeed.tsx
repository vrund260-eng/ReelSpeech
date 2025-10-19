import React, { useState, useMemo } from 'react';
import VideoPlayer from './VideoPlayer';
import { Video, User } from '../types';
import Icon from './Icon';

interface VideoFeedProps {
  videos: Video[];
  onVideoUpdate: (video: Video) => void;
  currentUser: User;
  onFollowUser: (userToFollow: User) => void;
  forYouVideos: Video[] | null;
  isGeneratingForYou: boolean;
  onGenerateForYouFeed: () => void;
  generationError: string | null;
}

const VideoFeed: React.FC<VideoFeedProps> = ({ videos, onVideoUpdate, currentUser, onFollowUser, forYouVideos, isGeneratingForYou, onGenerateForYouFeed, generationError }) => {
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);
  const [activeFeed, setActiveFeed] = useState<'following' | 'for-you'>('following');

  const handleTabClick = (feed: 'following' | 'for-you') => {
    setActiveFeed(feed);
    if (feed === 'for-you' && forYouVideos === null) {
      onGenerateForYouFeed();
    }
  };

  const followingVideos = useMemo(() => videos.filter(video => 
    currentUser.followingUsernames.includes(video.user.username) || video.user.username === currentUser.username
  ), [videos, currentUser]);

  const videosToDisplay = activeFeed === 'following' ? followingVideos : forYouVideos;
  
  const renderFeedContent = () => {
    if (activeFeed === 'for-you') {
        if (isGeneratingForYou) {
             return (
               <div className="h-screen w-full flex flex-col items-center justify-center text-white text-center p-4">
                 <Icon type="sparkles" className="h-16 w-16 text-pink-400 animate-pulse mb-4" />
                 <p className="text-lg font-semibold">Generating your personalized feed...</p>
                 <p className="text-gray-400">The AI is finding videos you'll love.</p>
               </div>
            );
        }
        if (generationError) {
             return (
               <div className="h-screen w-full flex flex-col items-center justify-center text-white text-center p-4">
                 <p className="text-lg font-semibold text-red-500">Something went wrong</p>
                 <p className="text-gray-400 mb-4">{generationError}</p>
                 <button onClick={onGenerateForYouFeed} className="bg-pink-600 text-white font-bold py-2 px-4 rounded-lg">Try Again</button>
               </div>
            );
        }
         if (forYouVideos && forYouVideos.length === 0) {
             return (
               <div className="h-screen w-full flex flex-col items-center justify-center text-white text-center p-4">
                 <Icon type="discover" className="h-16 w-16 text-gray-500 mb-4" />
                 <p className="text-lg font-semibold">All Caught Up!</p>
                 <p className="text-gray-400">We couldn't find any new recommendations right now. Check back later!</p>
               </div>
            );
        }
    }

    if (activeFeed === 'following' && followingVideos.length === 0) {
        return (
           <div className="h-screen w-full flex flex-col items-center justify-center text-white text-center p-4">
             <Icon type="profile" className="h-16 w-16 text-gray-500 mb-4" />
             <p className="text-lg font-semibold">Your Feed is Quiet</p>
             <p className="text-gray-400">Follow some creators to see their videos here!</p>
           </div>
        );
    }

    return videosToDisplay?.map((video) => (
        <VideoPlayer
          key={`${activeFeed}-${video.id}`}
          video={video}
          isActive={activeVideoId === video.id}
          setActiveVideoId={setActiveVideoId}
          onVideoUpdate={onVideoUpdate}
          currentUser={currentUser}
          onFollow={onFollowUser}
        />
      ));
  }


  return (
    <div className="relative h-full w-full">
       <div className="absolute top-0 left-0 right-0 z-10 flex justify-center p-4 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center gap-4 text-lg text-white font-semibold">
           <button onClick={() => handleTabClick('following')} className={`transition-colors ${activeFeed === 'following' ? 'text-white' : 'text-gray-400'}`}>Following</button>
           <div className="h-4 w-px bg-gray-600"></div>
           <button onClick={() => handleTabClick('for-you')} className={`transition-colors ${activeFeed === 'for-you' ? 'text-white' : 'text-gray-400'}`}>For You</button>
        </div>
      </div>
      <div className="h-full w-full snap-y snap-mandatory overflow-y-scroll">
       {renderFeedContent()}
      </div>
    </div>
  );
};

export default VideoFeed;
