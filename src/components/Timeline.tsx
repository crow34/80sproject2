import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTimeline } from '../hooks/useTimeline';
import { useAuth } from '../hooks/useAuth';
import { MessageSquare, Heart, Film, Send } from 'lucide-react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface TimelineProps {
  userId?: string;
}

export function Timeline({ userId }: TimelineProps) {
  const { posts, loading, hasMore, loadMore, addPost, addComment, toggleLike } = useTimeline();
  const { user } = useAuth();
  const [newPost, setNewPost] = useState('');
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const loader = useRef(null);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loading) {
      loadMore();
    }
  }, [hasMore, loading, loadMore]);

  useIntersectionObserver(loader, handleObserver);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    await addPost(newPost);
    setNewPost('');
  };

  const handleSubmitComment = async (postId: string) => {
    const comment = commentInputs[postId];
    if (!comment?.trim()) return;

    await addComment(postId, comment);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const toggleComments = (postId: string) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  return (
    <div className="space-y-6">
      {!userId && (
        <form onSubmit={handleSubmitPost} className="bg-gray-900 rounded-lg p-4">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share your thoughts about the challenge..."
            className="w-full bg-gray-800 text-white rounded-lg p-4 mb-4 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            rows={3}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newPost.trim()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Post
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-gray-900 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <Link
                to={`/profile/${post.userId}`}
                className="font-bold text-red-500 hover:text-red-400"
              >
                {post.userEmail.split('@')[0]}
              </Link>
              <span className="text-sm text-gray-400">
                {post.createdAt.toLocaleDateString()}
              </span>
            </div>

            <p className="text-gray-300 mb-4">{post.content}</p>

            {post.movieId && post.movieTitle && (
              <Link
                to={`/movie/${post.movieId}`}
                className="flex items-center space-x-2 text-gray-400 hover:text-red-500 mb-4"
              >
                <Film className="w-4 h-4" />
                <span>{post.movieTitle}</span>
              </Link>
            )}

            <div className="flex items-center space-x-6">
              <button
                onClick={() => toggleLike(post.id)}
                className="flex items-center space-x-2 text-gray-400 hover:text-red-500"
              >
                <Heart
                  className={`w-5 h-5 ${
                    post.likes.includes(user?.uid || '') ? 'fill-current text-red-500' : ''
                  }`}
                />
                <span>{post.likes.length}</span>
              </button>
              <button
                onClick={() => toggleComments(post.id)}
                className="flex items-center space-x-2 text-gray-400 hover:text-red-500"
              >
                <MessageSquare className="w-5 h-5" />
                <span>{post.comments.length}</span>
              </button>
            </div>

            {showComments[post.id] && (
              <div className="mt-4 space-y-4">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-800 rounded-lg p-3">
                    <Link
                      to={`/profile/${comment.userId}`}
                      className="font-bold text-sm text-red-500 hover:text-red-400"
                    >
                      {comment.userEmail.split('@')[0]}
                    </Link>
                    <p className="text-gray-300 text-sm mt-1">{comment.content}</p>
                  </div>
                ))}

                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={commentInputs[post.id] || ''}
                    onChange={(e) =>
                      setCommentInputs(prev => ({
                        ...prev,
                        [post.id]: e.target.value
                      }))
                    }
                    placeholder="Write a comment..."
                    className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    onClick={() => handleSubmitComment(post.id)}
                    disabled={!commentInputs[post.id]?.trim()}
                    className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-center items-center py-8">
            <Film className="w-8 h-8 animate-spin text-red-500" />
          </div>
        )}

        <div ref={loader} className="h-4" />
      </div>
    </div>
  );
}