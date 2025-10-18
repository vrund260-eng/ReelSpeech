import React, { useState } from 'react';
import VideoPlayer from './VideoPlayer';
import { Video } from '../types';

interface VideoFeedProps {
  videos: Video[];
  onVideoUpdate: (video: Video) => void;
}

const VideoFeed: React.FC<VideoFeedProps> = ({ videos, onVideoUpdate }) => {
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
        />
      ))}
    </div>
  );
};

export default VideoFeed;