// src/components/ChatForm.tsx
import React, { useState, FormEvent } from 'react';
import { Send } from 'lucide-react'; // Example send icon

interface ChatFormProps {
  chatHistory: any[]; // Use a more specific type if available
  setChatHistory: React.Dispatch<React.SetStateAction<any[]>>;
  generateBotResponse: (history: any[]) => Promise<void>;
}

const ChatForm: React.FC<ChatFormProps> = ({ chatHistory, setChatHistory, generateBotResponse }) => {
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const userMessage = inputValue.trim();
    if (!userMessage || isSending) return; // Prevent empty/double submission

    setIsSending(true); // Disable input/button

    // Add user message to history immediately
    const newUserMessage = { role: "user", text: userMessage };
    const thinkingMessage = { role: "model", text: "Thinking..." };
    const updatedHistory = [...chatHistory, newUserMessage, thinkingMessage];
    setChatHistory(updatedHistory);
    setInputValue(''); // Clear input field

    // Call the function to generate response (passing history *without* the thinking message for the API)
    try {
        await generateBotResponse([...chatHistory, newUserMessage]);
    } catch (error) {
        console.error("Error in generating response:", error);
        // Error handling might already be inside generateBotResponse
        // If not, add error message to history here
    } finally {
        setIsSending(false); // Re-enable input/button
    }
  };

  return (
    <form onSubmit={handleSubmit} className="chat-input-form"> {/* Add a class for styling */}
      <textarea
        placeholder="Type your message..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        disabled={isSending}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        rows={1} // Start with 1 row, CSS can make it expandable
        style={{ resize: 'none', overflowY: 'auto' }} // Basic styling
      />
      <button type="submit" disabled={isSending} className="send-button"> {/* Add a class */}
         <Send size={20} /> {/* Example icon */}
      </button>
    </form>
  );
};

export default ChatForm;