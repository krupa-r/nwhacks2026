import React, { useEffect, useRef, useState } from 'react';
import '../styles/Main.css';

interface Message {
  role: 'assistant' | 'user';
  content: React.ReactNode;
}

const Main: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Please provide your emergency details' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showMaps, setShowMaps] = useState(false);
  const [categoryChosen, setCategoryChosen] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [fallModalOpen, setFallModalOpen] = useState(false);
  const [fallCountdown, setFallCountdown] = useState(60);
  const [fallDetected, setFallDetected] = useState(false);
  const fallTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Voice synthesis for assistant responses
 useEffect(() => {
  if (messages.length === 0) return;

  const lastMsg = messages[messages.length - 1];

  // Only speak assistant messages, and only if the content is a string
  if (lastMsg.role === 'assistant' && !isMuted) {
    const text = typeof lastMsg.content === 'string' ? lastMsg.content : '';

    if (text && 'speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1;
      utter.pitch = 1;
      utter.lang = 'en-US';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    }
  } else if (isMuted && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}, [messages, isMuted]);

  // Fall detection logic
  useEffect(() => {
    function handleMotion(event: DeviceMotionEvent) {
      if (event.accelerationIncludingGravity) {
        const { x, y, z } = event.accelerationIncludingGravity;
        const magnitude = Math.sqrt((x || 0) ** 2 + (y || 0) ** 2 + (z || 0) ** 2);
        // Threshold for fall detection (tune as needed)
        if (magnitude > 22 && !fallDetected) {
          setFallDetected(true);
          setFallModalOpen(true);
          setFallCountdown(60);
        }
      }
    }
    window.addEventListener('devicemotion', handleMotion);
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [fallDetected]);

  // Countdown logic
  useEffect(() => {
    if (fallModalOpen) {
      countdownIntervalRef.current = setInterval(() => {
        setFallCountdown((prev) => prev - 1);
      }, 1000);
      fallTimeoutRef.current = setTimeout(() => {
        setFallModalOpen(false);
        setFallDetected(false);
        // Simulate calling hospital
        window.location.href = 'tel:911';
      }, 60000);
      return () => {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        if (fallTimeoutRef.current) clearTimeout(fallTimeoutRef.current);
      };
    }
  }, [fallModalOpen]);

  useEffect(() => {
    if (fallCountdown <= 0 && fallModalOpen) {
      setFallModalOpen(false);
      setFallDetected(false);
    }
  }, [fallCountdown, fallModalOpen]);

  const handleCancelFall = () => {
    setFallModalOpen(false);
    setFallDetected(false);
    setFallCountdown(60);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (fallTimeoutRef.current) clearTimeout(fallTimeoutRef.current);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: inputValue.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // TODO: Replace with your actual backend endpoint
      const API_URL = process.env.REACT_APP_API_URL;
      
      const response = await fetch(`${API_URL}/geminitest`, {
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

    // Second message (key words with bullet points)
        const keywordsMessage: Message = {
            role: 'assistant',
            content: (
                <>
                  <p  style={{ marginTop: '0px' }}>Here is a summary of the key remedies:</p>
                  <ul  style={{ marginBottom: '3px' }}>
                    {data.key_remedies.map((keyword: string, index: number) => (
                      <li key={index}>{keyword}</li>
                    ))}
                  </ul>
                </>
              ),
        };

      setMessages((prev) => [...prev, assistantMessage, keywordsMessage]);
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

  const handleCategoryClick = async (category: string) => {
    setCategoryChosen(category);
    setIsLoading(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL;
      const response = await fetch(`${API_URL}/geminitest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInput: category }),
      });
      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.long_paragraph || 'I received your message. Backend response pending.',
      };
      setMessages((prev) => [...prev, { role: 'user', content: category }, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, there was an error connecting to the server. Please try again.' }]);
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

  // Maps logic
  const [address, setAddress] = useState('');
  const [showDirections, setShowDirections] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationTried, setLocationTried] = useState(false);

  // Try to get user location when Locations tab is opened
  useEffect(() => {
    if (showMaps && !locationTried && !showDirections && !userCoords) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setShowDirections(true);
            setLocationTried(true);
          },
          () => {
            setLocationTried(true);
          }
        );
      } else {
        setLocationTried(true);
      }
    }
    // Reset on close
    if (!showMaps) {
      setShowDirections(false);
      setUserCoords(null);
      setLocationTried(false);
      setAddress('');
    }
  }, [showMaps, locationTried, showDirections, userCoords]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      setShowDirections(true);
      setUserCoords(null);
    }
  };

  const handleEditAddress = () => {
    setShowDirections(false);
    setUserCoords(null);
  };

  let mapSrc = '';
  if (showDirections) {
    if (userCoords) {
      mapSrc = `https://www.google.com/maps?saddr=${userCoords.lat},${userCoords.lng}&daddr=hospital&output=embed`;
    } else if (address.trim()) {
      mapSrc = `https://www.google.com/maps?saddr=${encodeURIComponent(address)}&daddr=hospital+near+${encodeURIComponent(address)}&output=embed`;
    }
  }

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
        {/* Plus button for fall detection, same size as other icons, bigger image */}
        <button
          className="fall-plus-btn"
          style={{
            marginTop: 24,
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            alignSelf: 'center',
            padding: 0,
          }}
          aria-label="Fall Detection Emergency"
          tabIndex={0}
          onClick={() => alert('This button activates automatic fall detection using your phone’s sensors.')}
        >
          <img src="/image/plus.png" alt="Emergency Plus" style={{ width: 44, height: 44 }} />
        </button>
      </div>
      {/* Fall detection modal */}
      {fallModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 350, textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.18)' }}>
            <h2 style={{ color: '#c00', marginBottom: 16 }}>Possible Fall Detected</h2>
            <p style={{ marginBottom: 16 }}>We detected a possible fall. If you do not cancel, we will call the nearest hospital in <b>{fallCountdown}</b> seconds.</p>
            <button onClick={handleCancelFall} style={{ background: '#eee', color: '#222', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}
      {showChat && (
        <>
          <div className="main-title-container">
            <h1 className="main-title">Emergency Health Assistant</h1>
          </div>
          <div className="chat-container">
            <div className="chat-content">
            <div className="chat-messages">
              {/* Category selection buttons at the top if not chosen yet */}
              {!categoryChosen && (
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '32px 0' }}>
                  <div style={{ fontWeight: 600, marginBottom: 16 }}>What is your main concern?</div>
                  <div style={{ display: 'flex', gap: 16 }}>
                  <button onClick={() => handleCategoryClick('shortness of breath')} style={{ padding: '12px 24px', fontSize: 16, borderRadius: 8, border: '1px solid #4c81b9', background: '#eaf3fb', cursor: 'pointer' }}>Shortness of Breath</button>
                  <button onClick={() => handleCategoryClick('chest pain')} style={{ padding: '12px 24px', fontSize: 16, borderRadius: 8, border: '1px solid #4c81b9', background: '#eaf3fb', cursor: 'pointer' }}>Chest Pain</button>
                  <button onClick={() => handleCategoryClick('continuous bleeding')} style={{ padding: '12px 24px', fontSize: 16, borderRadius: 8, border: '1px solid #4c81b9', background: '#eaf3fb', cursor: 'pointer' }}>Continuous Bleeding</button>
                </div>
				</div>
              )}
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.role}-message`} style={{ position: 'relative' }}>
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
              {/* Mute/unmute button above the text input bar */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                <button
                  onClick={() => setIsMuted((m) => !m)}
                  style={{
                    padding: '6px 18px',
                    borderRadius: 8,
                    border: '1px solid #4c81b9',
                    background: isMuted ? '#fbeaea' : '#eaf3fb',
                    color: '#222',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 15
                  }}
                  aria-label={isMuted ? 'Unmute voice' : 'Mute voice'}
                >
                  {isMuted ? 'Unmute' : 'Mute'}
                </button>
              </div>
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
              {!showDirections && (!userCoords || locationTried) && (
                <form onSubmit={handleAddressSubmit} style={{ marginBottom: 20 }}>
                  <label>
                    Enter your address:
                    <input
                      type="text"
                      value={address}
                      onChange={handleAddressChange}
                      style={{ marginLeft: 8, width: 300 }}
                      required
                    />
                  </label>
                  <button type="submit" style={{ marginLeft: 8 }}>Get Directions</button>
                </form>
              )}
              {showDirections && mapSrc && (
                <>
                  <iframe
                    title="Directions to Nearest Hospital"
                    src={mapSrc}
                    width="100%"
                    height="450"
                    style={{ border: 0, marginTop: 20 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                  {!userCoords && (
                    <button onClick={handleEditAddress} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 6, border: '1px solid #4c81b9', background: '#f5faff', cursor: 'pointer' }}>
                      Edit Address
                    </button>
                  )}
                </>
              )}
              {!showDirections && !locationTried && (
                <p>Detecting your location...</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Main;
