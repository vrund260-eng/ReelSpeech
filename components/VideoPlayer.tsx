import React, { useRef, useEffect, useState } from 'react';
import { Video } from '../types';
import Sidebar from './Sidebar';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import Icon from './Icon';

interface VideoPlayerProps {
  video: Video & { caption: string };
  isActive: boolean;
  setActiveVideoId: (id: number) => void;
  onVideoUpdate: (video: Video) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, isActive, setActiveVideoId, onVideoUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const entry = useIntersectionObserver(containerRef, { threshold: 0.5 });
  
  const isVisible = !!entry?.isIntersecting;

  useEffect(() => {
    if (isVisible) {
      setActiveVideoId(video.id);
    }
  }, [isVisible, video.id, setActiveVideoId]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isActive) {
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
        }).catch(error => {
          console.warn("Autoplay was prevented. Muting video to play.", error);
          videoElement.muted = true;
          setIsMuted(true);
          videoElement.play().then(() => {
            setIsPlaying(true);
          }).catch(finalError => {
            console.error("Failed to play video even after muting.", finalError);
            setIsPlaying(false);
          });
        });
      }
    } else {
      videoElement.pause();
      setIsPlaying(false);
    }

    return () => {
      if (videoElement) {
        videoElement.pause();
      }
    };
  }, [isActive]);


  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };
  
  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (videoRef.current) {
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(videoRef.current.muted);
    }
  }

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    const newLikesCount = newLikedState ? video.likes + 1 : video.likes - 1;
    onVideoUpdate({ ...video, likes: newLikesCount });
  };

  const handleComment = () => {
    onVideoUpdate({ ...video, comments: video.comments + 1 });
    alert('This would open a comment modal. For now, the count is just incremented.');
  };
  
  const handleShare = async () => {
    const shareData = {
        title: 'Check out this video on ReelTalk!',
        text: video.caption,
        url: window.location.href, // In a real app, this would be a deep link to the video
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
            onVideoUpdate({ ...video, shares: video.shares + 1 });
        } catch (error) {
            console.log('User cancelled share or something went wrong:', error);
        }
    } else {
        // Fallback for desktop or non-supporting browsers
        navigator.clipboard.writeText(shareData.url).then(() => {
            setShowCopyNotification(true);
            setTimeout(() => setShowCopyNotification(false), 2500);
            onVideoUpdate({ ...video, shares: video.shares + 1 });
        }).catch(err => {
            console.error('Failed to copy link:', err);
            alert('Could not copy link to clipboard.');
        });
    }
  };


  return (
    <div ref={containerRef} className="relative h-screen w-full snap-start flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        src={video.src}
        loop
        playsInline
        className="h-full w-full object-contain"
        onClick={handleVideoClick}
      />

      {showCopyNotification && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg z-20">
            Link copied to clipboard!
        </div>
      )}
      
      {!isPlaying && (
        <div className="absolute text-white" style={{ pointerEvents: 'none' }}>
           <Icon type="play" className="h-20 w-20 opacity-70" />
        </div>
      )}

      <div className="absolute bottom-0 left-0 p-4 text-white z-10 w-full bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-end">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <img src={video.user.avatar} alt={video.user.username} className="h-10 w-10 rounded-full border-2 border-white"/>
                    <h3 className="font-bold text-lg">{video.user.displayName}</h3>
                    <button className="text-pink-500 font-semibold border-2 border-pink-500 px-3 py-1 text-sm rounded-md hover:bg-pink-500 hover:text-white transition-colors">Follow</button>
                </div>
                <p className="text-base mb-2">{video.caption}</p>
                <div className="flex items-center gap-2">
                    <Icon type="music" className="h-5 w-5" />
                    <p className="text-sm font-semibold">{video.audioName}</p>
                </div>
            </div>
            <Sidebar 
                video={video} 
                onMuteToggle={handleMuteToggle} 
                isMuted={isMuted}
                isLiked={isLiked}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
            />
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;