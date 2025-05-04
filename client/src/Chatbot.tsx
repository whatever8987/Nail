import React, { useEffect, useRef, useState } from 'react';
import { X, MessageSquare, ChevronDown } from 'lucide-react';
import ChatbotIcon from './components/ChatbotIcon';
import ChatForm from './components/ChatForm';
import ChatMessage from './components/ChatMessage';
import { companyInfo } from './companyInfo';


interface ChatHistoryMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
  hideInChat?: boolean;
  suggestions?: string[];
}

interface ApiContentPart {
  text: string;
}

interface ApiContent {
  role: 'user' | 'model' | 'system';
  parts: ApiContentPart[];
}

const Chatbot: React.FC = () => {
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryMessage[]>([]);
  const initialMessageSent = useRef(false);
  const [isThinking, setIsThinking] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Verify API URL on component mount
  useEffect(() => {
    if (!import.meta.env.VITE_API_URL) {
      setApiError("API endpoint is not configured");
      console.error("VITE_API_URL is not defined in environment variables");
    }
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    if (apiError) {
      setChatHistory(prev => [...prev, { 
        role: 'model', 
        text: apiError,
        isError: true 
      }]);
      return;
    }

    const userMessage: ChatHistoryMessage = { role: 'user', text: suggestion };
    const thinkingMessage: ChatHistoryMessage = { role: 'model', text: 'Thinking...' };

    const newHistory = [...chatHistory, userMessage, thinkingMessage];
    setChatHistory(newHistory);
    setIsThinking(true);
    generateBotResponse(newHistory);
  };

  const generateBotResponse = async (currentHistory: ChatHistoryMessage[]) => {
    if (apiError) {
      updateHistory(apiError, true);
      return;
    }

    setIsThinking(true);

    const updateHistory = (text: string, isError = false) => {
      setChatHistory(prev => {
        const historyWithoutThinking = prev.filter(msg => msg.text !== "Thinking...");
        return [...historyWithoutThinking, { role: "model", text, isError }];
      });
      setIsThinking(false);
    };

    try {
      const visibleHistory = currentHistory.filter(msg => !msg.hideInChat && msg.text !== "Thinking...");
      const historyForApi: ApiContent[] = visibleHistory.map(({ role, text }) => ({
        role,
        parts: [{ text }]
      }));

      const systemInstruction: ApiContent = {
        role: "user",
        parts: [{
          text: `SYSTEM PROMPT: You are a helpful assistant for Pussco.
Your goal is to answer user questions based *only* on the following information about the company.
Do not mention that you are a language model or AI. Be friendly and concise.

Company Information:
${companyInfo}

Now, answer the user's query based *only* on the information provided above.`
        }]
      };

      const contentsForApi: ApiContent[] = [systemInstruction, ...historyForApi];

      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest" // Helps identify AJAX requests
        },
        body: JSON.stringify({ contents: contentsForApi }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const apiResponseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!apiResponseText) {
        throw new Error("Received an empty response from the AI model.");
      }

      const cleanedText = apiResponseText.replace(/\*\*(.*?)\*\*/g, "$1").trim();
      updateHistory(cleanedText);

    } catch (error: any) {
      console.error("API Call failed:", error);
      updateHistory(error?.message || "Failed to connect to the chat service. Please try again later.", true);
    }
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      setTimeout(() => {
        chatBodyRef.current?.scrollTo({ 
          top: chatBodyRef.current.scrollHeight, 
          behavior: "smooth" 
        });
      }, 50);
    }
  }, [chatHistory]);

  useEffect(() => {
    if (!initialMessageSent.current && chatHistory.filter(msg => !msg.hideInChat).length === 0) {
      setTimeout(() => {
        setChatHistory(prev => [
          ...prev,
          { 
            role: "model",
            text: "Hey there 👋\nHow can I help you today?",
            suggestions: [
              
            ]
          }
        ]);
      }, 300);
      initialMessageSent.current = true;
    }
  }, [chatHistory]);

  return (
    <div className="chatbot-container">
      <button
        className={`chatbot-toggle ${showChatbot ? 'open' : ''}`}
        onClick={() => setShowChatbot(!showChatbot)}
        aria-label={showChatbot ? "Close chat" : "Open chat"}
      >
        {showChatbot ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {showChatbot && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <ChatbotIcon />
              <h3>Chat Assistant</h3>
            </div>
            <button 
              className="chatbot-close"
              onClick={() => setShowChatbot(false)}
              aria-label="Close chat"
            >
              <ChevronDown size={20} />
            </button>
          </div>

          <div ref={chatBodyRef} className="chatbot-messages">
            {chatHistory
              .filter(chat => !chat.hideInChat)
              .map((chat, index) => (
                <ChatMessage
                  key={index}
                  chat={chat}
                  onSuggestionClick={handleSuggestionClick}
                />
              ))}
            {isThinking && (
              <ChatMessage
                key="thinking"
                chat={{ role: 'model', text: 'Thinking...' }}
              />
            )}
          </div>

          <div className="chatbot-input">
            <ChatForm
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              generateBotResponse={generateBotResponse}
              isThinking={isThinking || !!apiError}
              setIsThinking={setIsThinking}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;