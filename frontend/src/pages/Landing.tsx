import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Landing.css';

const Landing: React.FC = () => {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const navigate = useNavigate();

  const handleStartClick = () => {
    setShowDisclaimer(true);
  };

  const handleContinue = () => {
    navigate('/main');
  };

  const handleCloseDisclaimer = () => {
    setShowDisclaimer(false);
  };

  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1 className="landing-title">Emergency Health Assistant</h1>
        <p className="landing-description">
          You can ask your emergency health related questions here to get a quick response for next steps.
        </p>
        <button className="start-button" onClick={handleStartClick}>
          Start
        </button>
      </div>

      {showDisclaimer && (
        <div className="modal-overlay" onClick={handleCloseDisclaimer}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="disclaimer-title">Important Disclaimer</h2>
            <p className="disclaimer-text">
              Users must first call 911 in the case of an emergency.
            </p>
            <p className="disclaimer-text">
              This application is for informational purposes only and should not replace professional medical advice or emergency services.
            </p>
            <button className="continue-button" onClick={handleContinue}>
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
