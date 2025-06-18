'use client';

import React, { useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * ChatDisplay Component
 * Manages and displays chat history with user and bot messages
 */
export default function ChatDisplay({ messages, isLoading }) {
  // Ref for auto-scrolling to bottom of chat
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="h-full flex flex-col">
      {/* Chat Messages Container */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.length === 0 ? (
          // Welcome message when no messages exist
          <div className="text-center text-gray-500 py-8">
            <p className="text-lg">👋 안녕하세요! 건강 상담을 도와드릴게요.</p>
            <p className="text-sm mt-2">아래에 건강 고민을 입력해 주세요.</p>
          </div>
        ) : (
          // Display all messages
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] px-4 py-3 rounded-2xl ${message.isUser
                  ? 'bg-gray-200 text-gray-800'
                  : 'bg-purple-100 text-gray-800'
                  }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <p className="text-xs opacity-60 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-purple-100 text-gray-800 px-4 py-3 rounded-2xl">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">답변을 준비하고 있어요...</span>
              </div>
            </div>
          </div>
        )}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
} 