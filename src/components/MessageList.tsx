import React from 'react';
import { Message } from '../hooks/useMessages';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div key={message.id} className="bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm text-gray-400">
              {message.userEmail?.split('@')[0]}
            </span>
            <span className="text-xs text-gray-500">
              {message.createdAt.toLocaleDateString()} {message.createdAt.toLocaleTimeString()}
            </span>
          </div>
          <p className="text-gray-300">{message.content}</p>
        </div>
      ))}
    </div>
  );
}