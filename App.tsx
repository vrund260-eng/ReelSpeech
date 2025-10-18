import React, { useState, useEffect } from 'react';
import VideoFeed from './components/VideoFeed';
import ChatView from './components/ChatView';
import CreateView from './components/CreateView';
import BottomNav from './components/BottomNav';
import AuthView from './components/AuthView';
import ProfileView from './components/ProfileView';
import { Video, User } from './types';

type View = 'home' | 'create' | 'chat' | 'profile';

const mockUsers: User[] = [
  { username: 'naturelover', displayName: 'Nature Lover', avatar: 'https://picsum.photos/id/1027/100/100', email: 'nature@example.com', phone: '+11111111111', password: 'password123' },
  { username: 'bunnyfan', displayName: 'Bunny Fan', avatar: 'https://picsum.photos/id/237/100/100', email: 'bunny@example.com', phone: '+12222222222', password: 'password123' },
  { username: 'dreamscapes', displayName: 'Dream Scapes', avatar: 'https://picsum.photos/id/1015/100/100', email: 'dreams@example.com', phone: '+13333333333', password: 'password123' },
  { username: 'techguru', displayName: 'Tech Guru', avatar: 'https://picsum.photos/id/1074/100/100', email: 'guru@example.com', phone: '+14444444444', password: 'password123' },
  { username: 'citylights', displayName: 'City Lights', avatar: 'https://picsum.photos/id/1084/100/100', email: 'city@example.com', phone: '+15555555555', password: 'password123' },
  { username: 'foodie', displayName: 'Foodie', avatar: 'https://picsum.photos/id/1080/100/100', email: 'food@example.com', phone: '+16666666666', password: 'password123' },
];

const mockVideos: Video[] = [
  {
    id: 1,
    src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    user: mockUsers[0],
    caption: 'Just a beautiful day in the mountains! 🏔️ #nature #hiking #adventure',
    audioName: `Original Audio - ${mockUsers[0].displayName}`,
    likes: 12345,
    comments: 678,
    shares: 910,
  },
  {
    id: 2,
    src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    user: mockUsers[2],
    caption: 'Exploring some surreal landscapes. What do you think? #art #cgi #surreal',
    audioName: 'Dreamy Lo-fi - Aesthetic Sounds',
    likes: 54321,
    comments: 1234,
    shares: 567,
  },
  {
    id: 3,
    src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    user: mockUsers[1],
    caption: 'My bunny is the cutest! 😍 #bunny #cute #pets',
    audioName: 'Funny Tune - Comical Beats',
    likes: 9876,
    comments: 543,
    shares: 210,
  },
];

const LOCAL_STORAGE_KEYS = {
    USERS: 'reeltalk_users',
    VIDEOS: 'reeltalk_videos',
    LOGGED_IN_USER: 'reeltalk_loggedin_user',
};

const getFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn(`Error reading localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

const initialUsers = getFromStorage(LOCAL_STORAGE_KEYS.USERS, mockUsers);
const initialVideos = getFromStorage(LOCAL_STORAGE_KEYS.VIDEOS, mockVideos).map(video => ({
    ...video,
    user: initialUsers.find(u => u.username === video.user.username) || video.user
}));
const initialLoggedInUsername = getFromStorage<string | null>(LOCAL_STORAGE_KEYS.LOGGED_IN_USER, null);
const initialCurrentUser = initialLoggedInUsername 
    ? initialUsers.find(u => u.username === initialLoggedInUsername) || null 
    : null;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(initialCurrentUser);

  useEffect(() => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (error) {
        console.warn('Error saving users to localStorage:', error);
    }
  }, [users]);

  useEffect(() => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
    } catch (error) {
        console.warn('Error saving videos to localStorage:', error);
    }
  }, [videos]);

  useEffect(() => {
    try {
        if (currentUser) {
            localStorage.setItem(LOCAL_STORAGE_KEYS.LOGGED_IN_USER, currentUser.username);
        } else {
            localStorage.removeItem(LOCAL_STORAGE_KEYS.LOGGED_IN_USER);
        }
    } catch (error) {
        console.warn('Error saving current user to localStorage:', error);
    }
  }, [currentUser]);

  const handleLogin = (usernameOrEmail: string, password: string): boolean => {
    const user = users.find(
      u => (u.username.toLowerCase() === usernameOrEmail.toLowerCase() || (u.email && u.email.toLowerCase() === usernameOrEmail.toLowerCase())) && u.password === password
    );
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const handleSignUp = (newUser: Omit<User, 'avatar'>): boolean => {
    const exists = users.some(
      u => u.username.toLowerCase() === newUser.username.toLowerCase() || (u.email && u.email.toLowerCase() === newUser.email?.toLowerCase())
    );
    if (exists) {
      return false;
    }
    const userWithAvatar: User = {
      ...newUser,
      avatar: `https://picsum.photos/seed/${newUser.username}/100/100`,
    };
    setUsers(prev => [...prev, userWithAvatar]);
    setCurrentUser(userWithAvatar);
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('home');
  };

  const handlePostVideo = (newVideoData: Omit<Video, 'id' | 'user' | 'likes' | 'comments' | 'shares'>) => {
    if (!currentUser) return;
    const newVideo: Video = {
      ...newVideoData,
      id: Date.now(), // Use timestamp for more robust unique ID
      user: currentUser,
      likes: 0,
      comments: 0,
      shares: 0,
    };
    setVideos(prevVideos => [newVideo, ...prevVideos]);
    setCurrentView('home');
  };

  const handleVideoUpdate = (updatedVideo: Video) => {
    setVideos(prevVideos => 
      prevVideos.map(v => v.id === updatedVideo.id ? updatedVideo : v)
    );
  };

  if (!currentUser) {
    return <AuthView onLogin={handleLogin} onSignUp={handleSignUp} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <VideoFeed videos={videos} onVideoUpdate={handleVideoUpdate} />;
      case 'create':
        return <CreateView onPostVideo={handlePostVideo} />;
      case 'chat':
        return <ChatView currentUser={currentUser} allUsers={users} />;
      case 'profile':
        return <ProfileView user={currentUser} onLogout={handleLogout} />;
      default:
        return <VideoFeed videos={videos} onVideoUpdate={handleVideoUpdate} />;
    }
  };

  return (
    <div className="h-screen w-screen bg-black flex flex-col">
      <main className="flex-1 overflow-hidden">
        {renderView()}
      </main>
      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
};

export default App;