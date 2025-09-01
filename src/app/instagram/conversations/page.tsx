'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Instagram, Send, Image, Clock, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface InstagramConversation {
  _id: string;
  instagramUserId: string;
  instagramUsername: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  isWithin24Hours: boolean;
  customerInfo?: {
    profilePictureUrl?: string;
    followerCount?: number;
  };
  messages: Array<{
    id: string;
    senderId: 'customer' | 'agent';
    content: string;
    timestamp: string;
    messageType: string;
    mediaUrl?: string;
  }>;
}

export default function InstagramConversationsPage() {
  const [conversations, setConversations] = useState<InstagramConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<InstagramConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (user?.instagramAccounts?.[0]) {
      fetchConversations();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user data',
        variant: 'destructive'
      });
    }
  };

  const fetchConversations = async () => {
    if (!user?.instagramAccounts?.[0]) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/instagram/messages?instagramBusinessId=${user.instagramAccounts[0].instagramBusinessId}`
      );
      
      const data = await response.json();
      
      if (data.success) {
        setConversations(data.conversations);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    try {
      setSendingMessage(true);
      
      const response = await fetch('/api/instagram/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId: selectedConversation._id,
          message: newMessage,
          instagramBusinessId: user.instagramAccounts[0].instagramBusinessId
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update conversation with new message
        const updatedMessages = [...selectedConversation.messages, data.message];
        const updatedConversation = {
          ...selectedConversation,
          messages: updatedMessages,
          lastMessage: newMessage,
          lastMessageAt: new Date().toISOString()
        };

        setSelectedConversation(updatedConversation);
        
        // Update conversations list
        setConversations(prev => 
          prev.map(conv => 
            conv._id === selectedConversation._id ? updatedConversation : conv
          )
        );

        setNewMessage('');
        toast({
          title: 'Message sent',
          description: 'Your message has been sent successfully'
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setSendingMessage(false);
    }
  };

  if (!user?.instagramAccounts?.[0]) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Instagram className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Instagram Account Connected</h2>
          <p className="text-gray-600 mb-6">Connect your Instagram Business account to start managing conversations.</p>
          <button 
            onClick={() => window.location.href = '/home'}
            className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors"
          >
            Connect Instagram Account
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Conversations Sidebar */}
        <div className="w-1/3 border-r bg-white">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center gap-2">
              <Instagram className="h-5 w-5 text-pink-600" />
              <h1 className="font-semibold">Instagram Messages</h1>
            </div>
            <p className="text-sm text-gray-600">@{user.instagramAccounts[0].username}</p>
          </div>

          <div className="overflow-y-auto h-full">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No conversations yet</div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation._id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedConversation?._id === conversation._id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={conversation.customerInfo?.profilePictureUrl || '/default-avatar.png'}
                      alt={conversation.instagramUsername}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-gray-900 truncate">
                          @{conversation.instagramUsername}
                        </p>
                        <div className="flex items-center gap-1">
                          {!conversation.isWithin24Hours && (
                            <Clock className="h-4 w-4 text-amber-500" title="Outside 24-hour window" />
                          )}
                          {conversation.unreadCount > 0 && (
                            <span className="bg-pink-600 text-white text-xs px-2 py-1 rounded-full">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conversation.lastMessage}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(conversation.lastMessageAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b bg-white">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedConversation.customerInfo?.profilePictureUrl || '/default-avatar.png'}
                    alt={selectedConversation.instagramUsername}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">@{selectedConversation.instagramUsername}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      {selectedConversation.customerInfo?.followerCount?.toLocaleString()} followers
                      {!selectedConversation.isWithin24Hours && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <Clock className="h-4 w-4" />
                          Outside 24h window
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {selectedConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === 'agent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === 'agent'
                          ? 'bg-pink-600 text-white'
                          : 'bg-white text-gray-900'
                      }`}
                    >
                      {message.mediaUrl && (
                        <img
                          src={message.mediaUrl}
                          alt="Media"
                          className="rounded-lg mb-2 max-w-full h-auto"
                        />
                      )}
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.senderId === 'agent' ? 'text-pink-100' : 'text-gray-500'
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t bg-white">
                {selectedConversation.isWithin24Hours ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      disabled={sendingMessage}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sendingMessage || !newMessage.trim()}
                      className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {sendingMessage ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="flex items-center justify-center gap-2 text-amber-600 mb-2">
                      <Clock className="h-5 w-5" />
                      <span className="font-medium">24-hour messaging window expired</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      You can only send messages within 24 hours of the customer&apos;s last message on Instagram.
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Instagram className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm">Choose a conversation from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}