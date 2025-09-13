'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Instagram, Reply, Eye, EyeOff, Clock, User, Heart, MessageCircle, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface InstagramComment {
  _id: string;
  commentId: string;
  authorUsername: string;
  authorProfilePic?: string;
  text: string;
  timestamp: string;
  mediaId: string;
  mediaUrl?: string;
  mediaType: 'image' | 'video' | 'carousel';
  likeCount?: number;
  isHidden: boolean;
  status: 'new' | 'replied' | 'ignored' | 'escalated';
  priority: 'low' | 'medium' | 'high';
  sentiment?: 'positive' | 'negative' | 'neutral';
  businessReply?: {
    text: string;
    timestamp: string;
    agentName: string;
    status: 'sent' | 'failed';
  };
}

export default function InstagramCommentsPage() {
  const [comments, setComments] = useState<InstagramComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (user?.instagramAccounts?.[0]) {
      fetchComments();
    }
  }, [user, statusFilter]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchComments = async () => {
    if (!user?.instagramAccounts?.[0]) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        instagramBusinessId: user.instagramAccounts[0].instagramBusinessId
      });
      
      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/instagram/comments?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setComments(data.comments);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load comments',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCommentAction = async (commentId: string, action: 'reply' | 'hide' | 'show', replyText?: string) => {
    try {
      setSendingReply(true);
      
      const response = await fetch('/api/instagram/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          commentId,
          action,
          replyText
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update the comment in the list
        setComments(prev => 
          prev.map(comment => 
            comment.commentId === commentId ? { ...comment, ...data.comment } : comment
          )
        );

        if (action === 'reply') {
          setReplyingTo(null);
          setReplyText('');
          toast({
            title: 'Reply sent',
            description: 'Your reply has been posted successfully'
          });
        } else if (action === 'hide') {
          toast({
            title: 'Comment hidden',
            description: 'The comment has been hidden from public view'
          });
        } else if (action === 'show') {
          toast({
            title: 'Comment shown',
            description: 'The comment is now visible to the public'
          });
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error performing comment action:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Action failed',
        variant: 'destructive'
      });
    } finally {
      setSendingReply(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-400';
    }
  };

  if (!user?.instagramAccounts?.[0]) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Instagram className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Instagram Account Connected</h2>
          <p className="text-gray-600 mb-6">Connect your Instagram Business account to manage comments.</p>
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
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Instagram className="h-6 w-6 text-pink-600" />
            <h1 className="text-2xl font-bold text-gray-900">Instagram Comments</h1>
          </div>
          <p className="text-gray-600">Manage comments on your Instagram posts - @{user.instagramAccounts[0].username}</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                statusFilter === '' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Comments
            </button>
            <button
              onClick={() => setStatusFilter('new')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                statusFilter === 'new' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              New
            </button>
            <button
              onClick={() => setStatusFilter('replied')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                statusFilter === 'replied' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Replied
            </button>
            <button
              onClick={() => setStatusFilter('ignored')}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                statusFilter === 'ignored' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ignored
            </button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No comments found</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment._id} className="bg-white rounded-lg border p-6">
                {/* Comment Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={comment.authorProfilePic || '/default-avatar.png'}
                      alt={comment.authorUsername}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900">@{comment.authorUsername}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {new Date(comment.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(comment.priority)}`}>
                      {comment.priority}
                    </span>
                    {comment.sentiment && (
                      <span className={`text-sm ${getSentimentColor(comment.sentiment)}`}>
                        {comment.sentiment}
                      </span>
                    )}
                  </div>
                </div>

                {/* Comment Content */}
                <div className="mb-4">
                  <p className="text-gray-800 mb-3">{comment.text}</p>
                  
                  {/* Media Preview */}
                  {comment.mediaUrl && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>On post:</span>
                      <img
                        src={comment.mediaUrl}
                        alt="Post media"
                        className="w-12 h-12 rounded object-cover"
                      />
                      <a
                        href={`https://instagram.com/p/${comment.mediaId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-700 flex items-center gap-1"
                      >
                        View post <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  
                  {comment.likeCount !== undefined && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                      <Heart className="h-4 w-4" />
                      {comment.likeCount} likes
                    </div>
                  )}
                </div>

                {/* Business Reply */}
                {comment.businessReply && (
                  <div className="bg-pink-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-pink-600 rounded-full flex items-center justify-center">
                        <Reply className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Your reply</span>
                      <span className="text-xs text-gray-500">
                        by {comment.businessReply.agentName} • {new Date(comment.businessReply.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-800">{comment.businessReply.text}</p>
                  </div>
                )}

                {/* Reply Input */}
                {replyingTo === comment.commentId ? (
                  <div className="space-y-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your reply..."
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCommentAction(comment.commentId, 'reply', replyText)}
                        disabled={sendingReply || !replyText.trim()}
                        className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Reply className="h-4 w-4" />
                        {sendingReply ? 'Sending...' : 'Send Reply'}
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Action Buttons */
                  <div className="flex gap-2">
                    {!comment.businessReply && (
                      <button
                        onClick={() => setReplyingTo(comment.commentId)}
                        className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center gap-2"
                      >
                        <Reply className="h-4 w-4" />
                        Reply
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleCommentAction(comment.commentId, comment.isHidden ? 'show' : 'hide')}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                        comment.isHidden
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {comment.isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      {comment.isHidden ? 'Show' : 'Hide'}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}