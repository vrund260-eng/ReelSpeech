import React, { useState } from 'react';
import { Conversation, ChatMessage, User } from '../types';
import Icon from './Icon';
import FindFriends from './FindFriends';

// Note: In a real app, this data and the allUsers list would come from App.tsx props.
// For simplicity in this component, we redefine it.
const allUsers: User[] = [
  { username: 'naturelover', displayName: 'Nature Lover', avatar: 'https://picsum.photos/id/1027/100/100', email: 'nature@example.com', phone: '+11111111111', password: 'password123' },
  { username: 'bunnyfan', displayName: 'Bunny Fan', avatar: 'https://picsum.photos/id/237/100/100', email: 'bunny@example.com', phone: '+12222222222', password: 'password123' },
  { username: 'dreamscapes', displayName: 'Dream Scapes', avatar: 'https://picsum.photos/id/1015/100/100', email: 'dreams@example.com', phone: '+13333333333', password: 'password123' },
  { username: 'techguru', displayName: 'Tech Guru', avatar: 'https://picsum.photos/id/1074/100/100', email: 'guru@example.com', phone: '+14444444444', password: 'password123' },
  { username: 'citylights', displayName: 'City Lights', avatar: 'https://picsum.photos/id/1084/100/100', email: 'city@example.com', phone: '+15555555555', password: 'password123' },
  { username: 'foodie', displayName: 'Foodie', avatar: 'https://picsum.photos/id/1080/100/100', email: 'food@example.com', phone: '+16666666666', password: 'password123' },
];

const mockConversations: Conversation[] = [
  {
    id: 1,
    user: allUsers[0],
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
    user: allUsers[1],
    lastMessage: 'Haha, that was hilarious!',
    lastMessageTime: 'Yesterday',
    messages: [
       { id: 1, sender: 'me', text: "Did you see that new bunny cartoon?", timestamp: "Yesterday" },
       { id: 2, sender: 'them', text: "Haha, that was hilarious!", timestamp: "Yesterday" },
    ]
  },
  {
    id: 3,
    user: allUsers[2],
    lastMessage: 'Let me know what you think of this idea...',
    lastMessageTime: '2 days ago',
     messages: [
       { id: 1, sender: 'them', text: "Let me know what you think of this idea...", timestamp: "2 days ago" },
    ]
  },
];

interface ChatViewProps {
    currentUser: User;
    allUsers: User[];
}

const ChatView: React.FC<ChatViewProps> = ({ currentUser, allUsers }) => {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations.length > 0 ? conversations[0] : null);
  const [newMessage, setNewMessage] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'findFriends'>('list');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !selectedConversation) return;

    const message: ChatMessage = {
      id: Date.now(),
      sender: 'me',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedConversation = {
        ...selectedConversation,
        messages: [...selectedConversation.messages, message],
        lastMessage: newMessage,
        lastMessageTime: message.timestamp,
    };
    
    setSelectedConversation(updatedConversation);
    // Move the updated conversation to the top of the list
    const otherConversations = conversations.filter(c => c.id !== updatedConversation.id);
    setConversations([updatedConversation, ...otherConversations]);
    setNewMessage('');
  };
  
  const handleAddFriend = (friend: User) => {
    const existingConvo = conversations.find(c => c.user.username === friend.username);
    if (existingConvo) {
      setSelectedConversation(existingConvo);
    } else {
      const newConversation: Conversation = {
        id: Date.now(),
        user: friend,
        messages: [],
        lastMessage: `You are now connected with ${friend.displayName}.`,
        lastMessageTime: 'Now',
      };
      const newConversations = [newConversation, ...conversations];
      setConversations(newConversations);
      setSelectedConversation(newConversation);
    }
    setViewMode('list');
  };

  if (viewMode === 'findFriends') {
    return (
        <FindFriends 
            onBack={() => setViewMode('list')}
            onAddFriend={handleAddFriend}
            existingConversations={conversations}
            allUsers={allUsers}
            currentUser={currentUser}
        />
    )
  }

  return (
    <div className="h-full w-full flex text-white bg-gray-900">
      {/* Conversation List */}
      <div className="w-1/3 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">Messages</h2>
          <button onClick={() => setViewMode('findFriends')} className="text-gray-400 hover:text-white" aria-label="Find Friends">
            <Icon type="userPlus" className="h-6 w-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((convo) => (
            <div
              key={convo.id}
              className={`flex items-center p-3 cursor-pointer hover:bg-gray-800 ${selectedConversation?.id === convo.id ? 'bg-gray-700' : ''}`}
              onClick={() => setSelectedConversation(convo)}
            >
              <img src={convo.user.avatar} alt={convo.user.displayName} className="h-12 w-12 rounded-full mr-4" />
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between">
                  <span className="font-bold">{convo.user.displayName}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{convo.lastMessageTime}</span>
                </div>
                <p className="text-sm text-gray-400 truncate">{convo.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message View */}
      <div className="w-2/3 flex flex-col">
        {selectedConversation ? (
            <>
                <div className="p-3 border-b border-gray-700 flex items-center">
                    <img src={selectedConversation.user.avatar} alt={selectedConversation.user.displayName} className="h-10 w-10 rounded-full mr-3" />
                    <h3 className="text-lg font-bold">{selectedConversation.user.displayName}</h3>
                </div>
                <div className="flex-1 p-4 overflow-y-auto flex flex-col-reverse">
                    <div className="space-y-4">
                    {selectedConversation.messages.slice().reverse().map((msg) => (
                        <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'me' ? 'justify-end' : ''}`}>
                        {msg.sender === 'them' && <img src={selectedConversation.user.avatar} className="h-6 w-6 rounded-full" />}
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'me' ? 'bg-pink-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
                            <p>{msg.text}</p>
                            <p className="text-xs text-gray-400 mt-1 text-right">{msg.timestamp}</p>
                        </div>
                        </div>
                    ))}
                    </div>
                </div>
                <div className="p-4 border-t border-gray-700">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-700 rounded-full py-2 px-4 focus:outline-none"
                    />
                    <button type="submit" className="bg-pink-600 rounded-full p-2 hover:bg-pink-700 transition-colors">
                    <Icon type="send" className="h-6 w-6"/>
                    </button>
                </form>
                </div>
            </>
        ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
                <p>Select a conversation to start chatting.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ChatView;