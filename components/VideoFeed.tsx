import React, { useState } from 'react';
import VideoPlayer from './VideoPlayer';
import { Video, User } from '../types';

interface VideoFeedProps {
  videos: Video[];
  onVideoUpdate: (video: Video) => void;
  currentUser: User;
  onFollowUser: (userToFollow: User) => void;
}

const VideoFeed: React.FC<VideoFeedProps> = ({ videos, onVideoUpdate, currentUser, onFollowUser }) => {
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null);

  return (
    <div className="h-full w-full snap-y snap-mandatory overflow-y-scroll">
      {videos.map((video) => (
        <VideoPlayer
          key={video.id}
          video={video}
          isActive={activeVideoId === video.id}
          setActiveVideoId={setActiveVideoId}
          onVideoUpdate={onVideoUpdate}
          currentUser={currentUser}
          onFollow={onFollowUser}
        />
      ))}
    </div>
  );
};

export default VideoFeed;