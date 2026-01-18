import React, { useState, useRef, useEffect } from 'react';
import '../styles/Main.css';

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

const Main: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Please provide your emergency details' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showMaps, setShowMaps] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: inputValue.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // TODO: Replace with your actual backend endpoint
      const API_URL = process.env.REACT_APP_API_URL;
      
      const response = await fetch(`${API_URL}/openaiAPItest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInput: userMessage.content }),
      });

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.long_paragraph || 'I received your message. Backend response pending.',
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error fetching response:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, there was an error connecting to the server. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const handleNeedleClick = () => {
    setShowChat(!showChat);
    if (showMaps) setShowMaps(false);
  };

  const handleSuitcaseClick = () => {
    setShowMaps(!showMaps);
    if (showChat) setShowChat(false);
  };

  return (
    <div className="main-container">
      <div className="icons-wrapper">
        <div 
          className={`icon-container ${showChat ? 'active' : ''}`}
          onClick={handleNeedleClick}
        >
          <img src="/image/Needle.png" alt="Needle Icon" className="needle-icon" />
        </div>
        <div 
          className={`icon-container ${showMaps ? 'active' : ''}`}
          onClick={handleSuitcaseClick}
        >
          <img src="/image/Suitcase2.png" alt="Suitcase Icon" className="suitcase-icon" />
        </div>
      </div>

      {showChat && (
        <>
          <div className="main-title-container">
            <h1 className="main-title">Emergency Health Assistant</h1>
          </div>
          <div className="chat-container">
            <div className="chat-content">
            <div className="chat-messages">
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.role}-message`}>
                  <div className="message-content">{message.content}</div>
                </div>
              ))}
              {isLoading && (
                <div className="message assistant-message">
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-container">
              <div className="chat-input-wrapper">
                <textarea
                  className="chat-input"
                  value={inputValue}
                  onChange={handleTextareaChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  rows={1}
                  disabled={isLoading}
                />
                <button
                  className="send-button"
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22 2L11 13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M22 2L15 22L11 13L2 9L22 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          </div>
        </>
      )}

      {showMaps && (
        <>
          <div className="main-title-container">
            <h1 className="main-title">Locations</h1>
          </div>
          <div className="maps-container">
            <div className="maps-content">
              {/* Google Maps will be embedded here later */}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Main;
