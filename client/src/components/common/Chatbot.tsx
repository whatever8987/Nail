// src/components/common/Chatbot.tsx
import React, { useState, useRef, useEffect } from 'react'; // Ensure React is imported
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageSquare,
  ChevronDown,
  X,
  Send,
  Bot,
  User
} from "lucide-react";
import { cn } from "@/lib/utils"; // Keep utility if needed for styling

// Define Message type locally
type Message = {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
};

// Sample initial message data
const initialMessageTime = new Date();
initialMessageTime.setHours(19, 57, 0, 0);

const initialMessages: Message[] = [
  {
    id: "1",
    content: "Hi there! 👋 I'm your helpful assistant. How can I help you today? (This is a UI demo)",
    sender: "bot",
    timestamp: initialMessageTime,
  }
];

// Sample quick questions
const commonQuestions = [
  "What services do you offer?",
  "What are the prices?",
  "How do I book?"
];

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(true); // Start open for visibility
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false); // Simulate typing state

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- Scroll Logic ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized, messages]); // Rerun on messages change too

  // --- Simulated Message Handling ---
  const handleSendMessage = () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: trimmedInput,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot thinking and responding
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `Okay, you said: "${trimmedInput}". In a real app, I'd process this. For now, here's a placeholder response. Try asking about services, prices, or booking!`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1200); // Simulate delay
  };

  const handleQuickQuestion = (question: string) => {
     const userMessage: Message = {
      id: Date.now().toString(),
      content: question,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
     // Simulate bot response to quick question
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `Okay, you asked: "${question}". Here is a simulated answer about that topic...`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  // --- UI Toggles ---
  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) { // If opening
       setIsMinimized(false); // Ensure it's not minimized when opened
    }
  };

  const minimizeChat = () => setIsMinimized(true);
  const expandChat = () => setIsMinimized(false);

  // --- Render Logic ---
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {!isOpen && (
        <Button
          onClick={toggleChat}
          className="rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-purple-600 to-blue-500 border-0 flex items-center justify-center hover:opacity-90 transition-opacity"
          aria-label="Open chat"
        >
          <MessageSquare className="h-6 w-6 text-white" />
        </Button>
      )}

      {isOpen && (
        <div className={cn(
          "bg-background border border-border rounded-lg shadow-xl transition-all duration-300 overflow-hidden flex flex-col", // Use theme variables
          isMinimized ? "w-72 h-16" : "w-80 sm:w-96 h-[32rem] max-h-[calc(100vh-6rem)]"
        )}>
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-3 flex justify-between items-center flex-shrink-0 cursor-pointer" onClick={isMinimized ? expandChat : undefined}>
            <div className="flex items-center text-white">
                <Avatar className="h-8 w-8 mr-2 border-2 border-white/30 flex-shrink-0">
                    <AvatarFallback className="bg-purple-700 text-white">
                    <Bot className="h-4 w-4" />
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-medium text-sm">Salon Assistant</p>
                    {!isMinimized && <p className="text-xs opacity-80">Online</p>}
                </div>
            </div>
            <div className="flex items-center space-x-1">
              {!isMinimized && (
                <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20 rounded-full" onClick={(e) => { e.stopPropagation(); minimizeChat(); }} aria-label="Minimize chat">
                  <ChevronDown className="h-5 w-5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20 rounded-full" onClick={(e) => { e.stopPropagation(); toggleChat(); }} aria-label="Close chat">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Chat Body (only if not minimized) */}
          {!isMinimized && (
            <>
              <div className="flex-grow p-4 overflow-y-auto bg-background min-h-0">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn("flex items-start gap-2.5", message.sender === "user" ? "justify-end" : "justify-start")}
                    >
                      {message.sender === "bot" && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="bg-purple-600 text-white"><Bot className="h-4 w-4" /></AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg px-3 py-2 shadow-sm",
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground" // Use theme variables
                            : "bg-muted text-muted-foreground" // Use theme variables
                        )}
                      >
                        <p className="text-sm leading-snug">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1 text-right">
                          {message.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </p>
                      </div>
                       {message.sender === "user" && (
                         <Avatar className="h-8 w-8 flex-shrink-0">
                           <AvatarFallback className="bg-blue-500 text-white"><User className="h-4 w-4" /></AvatarFallback>
                         </Avatar>
                       )}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-start gap-2.5">
                       <Avatar className="h-8 w-8 flex-shrink-0">
                         <AvatarFallback className="bg-purple-600 text-white"><Bot className="h-4 w-4" /></AvatarFallback>
                       </Avatar>
                      <div className="bg-muted rounded-lg px-4 py-2.5"> {/* Adjusted padding */}
                        <div className="flex space-x-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"></div>
                          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.1s]"></div>
                          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Quick Questions */}
              <div className="px-4 py-2 border-t border-border overflow-x-auto whitespace-nowrap flex-shrink-0" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                <div className="flex space-x-2">
                  {commonQuestions.map((question, index) => (
                    <button
                      key={index}
                      className="text-xs px-3 py-1.5 border border-border rounded-full hover:bg-accent hover:text-accent-foreground whitespace-nowrap transition-colors text-muted-foreground"
                      onClick={() => handleQuickQuestion(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-border bg-background flex-shrink-0">
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="flex items-center space-x-2"
                >
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow bg-background border-input focus:ring-primary focus:border-primary" // Use theme vars
                    aria-label="Chat message input"
                    autoComplete="off"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="bg-primary text-primary-foreground flex-shrink-0 hover:bg-primary/90 transition-opacity disabled:opacity-50"
                    disabled={!inputValue.trim()}
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}