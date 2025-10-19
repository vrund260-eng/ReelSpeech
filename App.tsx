import React, { useState, useEffect } from 'react';
import VideoFeed from './components/VideoFeed';
import ChatView from './components/ChatView';
import CreateView from './components/CreateView';
import BottomNav from './components/BottomNav';
import AuthView from './components/AuthView';
import ProfileView from './components/ProfileView';
import { Video, User, Conversation } from './types';
import { hashPassword } from './services/cryptoService';
import { videoDB } from './services/videoDB';
import { getForYouFeed } from './services/geminiService';

type View = 'home' | 'create' | 'chat' | 'profile';

const mockUsersData: Omit<User, 'passwordHash' | 'followers' | 'following' | 'followingUsernames'>[] = [
  { username: 'naturelover', displayName: 'Nature Lover', avatar: 'https://picsum.photos/id/1027/100/100', email: 'nature@example.com', phone: '+11111111111' },
  { username: 'bunnyfan', displayName: 'Bunny Fan', avatar: 'https://picsum.photos/id/237/100/100', email: 'bunny@example.com', phone: '+12222222222' },
  { username: 'dreamscapes', displayName: 'Dream Scapes', avatar: 'https://picsum.photos/id/1015/100/100', email: 'dreams@example.com', phone: '+13333333333' },
  { username: 'techguru', displayName: 'Tech Guru', avatar: 'https://picsum.photos/id/1074/100/100', email: 'guru@example.com', phone: '+14444444444' },
  { username: 'citylights', displayName: 'City Lights', avatar: 'https://picsum.photos/id/1084/100/100', email: 'city@example.com', phone: '+15555555555' },
  { username: 'foodie', displayName: 'Foodie', avatar: 'https://picsum.photos/id/1080/100/100', email: 'food@example.com', phone: '+16666666666' },
];

const mockVideos: Omit<Video, 'views'>[] = [
  {
    id: 1,
    src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    user: mockUsersData[0] as User,
    caption: 'Just a beautiful day in the mountains! 🏔️ #nature #hiking #adventure',
    audioName: `Original Audio - ${mockUsersData[0].displayName}`,
    likes: 12345,
    comments: 678,
    shares: 910,
  },
  {
    id: 2,
    src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    user: mockUsersData[2] as User,
    caption: 'Exploring some surreal landscapes. What do you think? #art #cgi #surreal',
    audioName: 'Dreamy Lo-fi - Aesthetic Sounds',
    likes: 54321,
    comments: 1234,
    shares: 567,
  },
  {
    id: 3,
    src: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    user: mockUsersData[1] as User,
    caption: 'My bunny is the cutest! 😍 #bunny #cute #pets',
    audioName: 'Funny Tune - Comical Beats',
    likes: 9876,
    comments: 543,
    shares: 210,
  },
];

const mockConversations: Conversation[] = [
  {
    id: 1,
    user: mockUsersData[0] as User,
    lastMessage: "Can't wait for our hike this weekend!",
    lastMessageTime: '10:42 AM',
    messages: [
      { id: 1, sender: 'them', text: "Hey! Loved your latest video!", timestamp: "10:40 AM" },
      { id: 2, sender: 'me', text: "Thanks so much! Glad you enjoyed it.", timestamp: "10:41 AM" },
      { id: 3, sender: 'them', text: "Can't wait for our hike this weekend!", timestamp: "10:42 AM" },
    ],
  },
  {
    id: 2,
    user: mockUsersData[1] as User,
    lastMessage: 'Haha, that was hilarious!',
    lastMessageTime: 'Yesterday',
    messages: [
       { id: 1, sender: 'me', text: "Did you see that new bunny cartoon?", timestamp: "Yesterday" },
       { id: 2, sender: 'them', text: "Haha, that was hilarious!", timestamp: "Yesterday" },
    ]
  },
  {
    id: 3,
    user: mockUsersData[2] as User,
    lastMessage: 'Let me know what you think of this idea...',
    lastMessageTime: '2 days ago',
     messages: [
       { id: 1, sender: 'them', text: "Let me know what you think of this idea...", timestamp: "2 days ago" },
    ]
  },
];

const LOCAL_STORAGE_KEYS = {
    USERS: 'reeltalk_users',
    VIDEOS: 'reeltalk_videos',
    LOGGED_IN_USER: 'reeltalk_loggedin_user',
    CONVERSATIONS: 'reeltalk_conversations',
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

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [videos, setVideos] = useState<Video[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [forYouVideos, setForYouVideos] = useState<Video[] | null>(null);
  const [isGeneratingForYou, setIsGeneratingForYou] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
        let storedUsers = getFromStorage<User[]>(LOCAL_STORAGE_KEYS.USERS, []);

        if (storedUsers.length === 0) {
            const hashedMockUsers = await Promise.all(
                mockUsersData.map(async (user) => ({
                    ...user,
                    passwordHash: await hashPassword('Password123!'),
                    followers: Math.floor(Math.random() * 10000) + 100,
                    following: Math.floor(Math.random() * 500),
                    followingUsernames: [],
                }))
            );
            storedUsers = hashedMockUsers;
        }
        setUsers(storedUsers);

        const storedVideos = getFromStorage<Video[]>(LOCAL_STORAGE_KEYS.VIDEOS, mockVideos.map(v => ({...v, views: Math.floor(Math.random() * 100000) + 1000})));
        const videosWithSrc = await Promise.all(
            storedVideos.map(async (video) => {
                if (video.isLocal) {
                    const videoBlob = await videoDB.get(video.id);
                    if (videoBlob) {
                        return { ...video, src: URL.createObjectURL(videoBlob) };
                    }
                    return null;
                }
                return video;
            })
        );

        const validVideos = videosWithSrc.filter((v): v is Video => v !== null);

        const rehydratedVideos = validVideos.map(video => ({
            ...video,
            user: storedUsers.find(u => u.username === video.user.username) || video.user
        }));
        setVideos(rehydratedVideos);

        const initialConversations = getFromStorage(LOCAL_STORAGE_KEYS.CONVERSATIONS, mockConversations);
        const rehydratedConversations = initialConversations.map(convo => ({
            ...convo,
            user: storedUsers.find(u => u.username === convo.user.username) || convo.user
        }));
        setConversations(rehydratedConversations);
        
        const initialLoggedInUsername = getFromStorage<string | null>(LOCAL_STORAGE_KEYS.LOGGED_IN_USER, null);
        const loggedInUser = initialLoggedInUsername
            ? storedUsers.find(u => u.username === initialLoggedInUsername) || null
            : null;
        setCurrentUser(loggedInUser);

        setIsInitialized(true);
    };

    initializeApp();
  }, []);


  useEffect(() => {
    if (!isInitialized) return;
    try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (error) {
        console.warn('Error saving users to localStorage:', error);
    }
  }, [users, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
        const videosToStore = videos.map(video => {
            if (video.isLocal) {
                const { src, ...videoToStore } = video;
                return videoToStore;
            }
            return video;
        });
        localStorage.setItem(LOCAL_STORAGE_KEYS.VIDEOS, JSON.stringify(videosToStore));
    } catch (error) {
        console.warn('Error saving videos to localStorage:', error);
    }
  }, [videos, isInitialized]);

    useEffect(() => {
    if (!isInitialized) return;
    try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch (error) {
        console.warn('Error saving conversations to localStorage:', error);
    }
  }, [conversations, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
        if (currentUser) {
            localStorage.setItem(LOCAL_STORAGE_KEYS.LOGGED_IN_USER, currentUser.username);
        } else {
            localStorage.removeItem(LOCAL_STORAGE_KEYS.LOGGED_IN_USER);
        }
    } catch (error) {
        console.warn('Error saving current user to localStorage:', error);
    }
  }, [currentUser, isInitialized]);

  const handleLogin = async (usernameOrEmail: string, password: string): Promise<boolean> => {
    const loginIdentifier = usernameOrEmail.trim().toLowerCase();
    const user = users.find(
      u => u.username.toLowerCase() === loginIdentifier || (u.email && u.email.toLowerCase() === loginIdentifier)
    );

    if (user && user.passwordHash) {
      const passwordHash = await hashPassword(password);
      if (passwordHash === user.passwordHash) {
        setCurrentUser(user);
        return true;
      }
    }
    return false;
  };

  const handleSignUp = async (newUserData: Omit<User, 'avatar' | 'passwordHash' | 'followers' | 'following' | 'followingUsernames'> & {password: string}): Promise<boolean> => {
    const exists = users.some(
      u => u.username.toLowerCase() === newUserData.username.toLowerCase() || (u.email && newUserData.email && u.email.toLowerCase() === newUserData.email.toLowerCase())
    );
    if (exists) {
      return false;
    }

    const passwordHash = await hashPassword(newUserData.password);

    const newUser: User = {
      displayName: newUserData.displayName,
      username: newUserData.username,
      email: newUserData.email,
      phone: newUserData.phone,
      passwordHash: passwordHash,
      avatar: `https://picsum.photos/seed/${newUserData.username}/100/100`,
      followers: 0,
      following: 0,
      followingUsernames: [],
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('home');
    setForYouVideos(null);
  };

  const handlePostVideo = async (newVideoData: { file: File, caption: string, audioName: string }) => {
    if (!currentUser) return;
    
    const { file, caption, audioName } = newVideoData;
    const newVideoId = Date.now();

    try {
        await videoDB.put(newVideoId, file);
        
        const newVideo: Video = {
            id: newVideoId,
            user: currentUser,
            src: URL.createObjectURL(file),
            caption,
            audioName,
            likes: 0,
            comments: 0,
            shares: 0,
            views: 0,
            isLocal: true,
        };

        setVideos(prevVideos => [newVideo, ...prevVideos]);
        setCurrentView('home');
    } catch (error) {
        console.error("Failed to save video:", error);
        alert("There was an error saving your video. Please try again.");
    }
  };

  const handleVideoUpdate = (updatedVideo: Video) => {
    setVideos(prevVideos => 
      prevVideos.map(v => v.id === updatedVideo.id ? updatedVideo : v)
    );
  };

  const handleFollowUser = (userToFollow: User) => {
    if (!currentUser || currentUser.username === userToFollow.username) return;

    const isFollowing = currentUser.followingUsernames.includes(userToFollow.username);

    if (isFollowing) return; // Or implement unfollow logic here

    const updatedUsers = users.map(u => {
        if (u.username === userToFollow.username) {
            return { ...u, followers: u.followers + 1 };
        }
        if (u.username === currentUser.username) {
            return { 
                ...u, 
                following: u.following + 1, 
                followingUsernames: [...u.followingUsernames, userToFollow.username]
            };
        }
        return u;
    });

    setUsers(updatedUsers);
    
    const updatedCurrentUser = updatedUsers.find(u => u.username === currentUser.username);
    if (updatedCurrentUser) {
        setCurrentUser(updatedCurrentUser);
    }
  };

  const handleGenerateForYouFeed = async () => {
    if (!currentUser) return;
    setIsGeneratingForYou(true);
    setGenerationError(null);
    try {
        const recommendedIds = await getForYouFeed(currentUser, videos);
        const recommendedVideos = videos.filter(v => recommendedIds.includes(v.id));
        setForYouVideos(recommendedVideos);
    } catch(err: any) {
        setGenerationError(err.message || "Failed to generate feed.");
        setForYouVideos([]); // Set to empty array on error
    } finally {
        setIsGeneratingForYou(false);
    }
  };


  if (!isInitialized) {
    return <div className="h-screen w-screen bg-gray-900 flex items-center justify-center text-white"><p>Loading...</p></div>;
  }

  if (!currentUser) {
    return <AuthView onLogin={handleLogin} onSignUp={handleSignUp} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <VideoFeed 
                    videos={videos} 
                    onVideoUpdate={handleVideoUpdate} 
                    currentUser={currentUser} 
                    onFollowUser={handleFollowUser}
                    forYouVideos={forYouVideos}
                    isGeneratingForYou={isGeneratingForYou}
                    onGenerateForYouFeed={handleGenerateForYouFeed}
                    generationError={generationError}
                />;
      case 'create':
        return <CreateView onPostVideo={handlePostVideo} />;
      case 'chat':
        return <ChatView currentUser={currentUser} allUsers={users} conversations={conversations} setConversations={setConversations} />;
      case 'profile':
        return <ProfileView user={currentUser} onLogout={handleLogout} videos={videos} conversations={conversations} />;
      default:
        return <VideoFeed 
                    videos={videos} 
                    onVideoUpdate={handleVideoUpdate} 
                    currentUser={currentUser} 
                    onFollowUser={handleFollowUser}
                    forYouVideos={forYouVideos}
                    isGeneratingForYou={isGeneratingForYou}
                    onGenerateForYouFeed={handleGenerateForYouFeed}
                    generationError={generationError}
                />;
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
