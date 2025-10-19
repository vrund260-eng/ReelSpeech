import React, { useState, useMemo } from 'react';
import { Conversation, ChatMessage, User } from '../types';
import Icon from './Icon';
import FindFriends from './FindFriends';

interface ChatViewProps {
    currentUser: User;
    allUsers: User[];
    conversations: Conversation[];
    setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
}

const ChatView: React.FC<ChatViewProps> = ({ currentUser, allUsers, conversations, setConversations }) => {
  const [selectedConvoId, setSelectedConvoId] = useState<number | null>(conversations[0]?.id ?? null);
  const [newMessage, setNewMessage] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'findFriends'>('list');

  const selectedConversation = useMemo(
    () => conversations.find(c => c.id === selectedConvoId),
    [conversations, selectedConvoId]
  );

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
    
    // Move the updated conversation to the top of the list
    setConversations(prev => [
        updatedConversation,
        ...prev.filter(c => c.id !== updatedConversation.id)
    ]);
    setNewMessage('');
  };
  
  const handleAddFriend = (friend: User) => {
    const existingConvo = conversations.find(c => c.user.username === friend.username);
    if (existingConvo) {
      setSelectedConvoId(existingConvo.id);
    } else {
      const newConversation: Conversation = {
        id: Date.now(),
        user: friend,
        messages: [],
        lastMessage: `You are now connected with ${friend.displayName}.`,
        lastMessageTime: 'Now',
      };
      setConversations(prev => [newConversation, ...prev]);
      setSelectedConvoId(newConversation.id);
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
              onClick={() => setSelectedConvoId(convo.id)}
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
