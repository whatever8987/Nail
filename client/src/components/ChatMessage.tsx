// src/components/ChatMessage.tsx
import React from 'react';

interface ChatMessageProps {
  chat: {
    role: 'user' | 'model';
    text: string;
    isError?: boolean;
    suggestions?: string[];
  };
  onSuggestionClick?: (suggestion: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ chat, onSuggestionClick }) => {
  return (
    <div 
      className={`chat-message ${chat.role} ${chat.isError ? 'error' : ''}`}
      data-lov-id={`message-${chat.role}`} // Moved to div instead of Fragment
    >
      <div className="message-content">
        {chat.text}
      </div>
      {chat.suggestions && chat.suggestions.length > 0 && (
        <div className="suggestions">
          {chat.suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="suggestion"
              onClick={() => onSuggestionClick?.(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;