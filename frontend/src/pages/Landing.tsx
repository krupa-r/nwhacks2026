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
      <div className="background-images">
        <img src="/image/Needle.png" alt="Needle" className="bg-image needle-bg" />
        <img src="/image/Needle.png" alt="Needle" className="bg-image needle-bg" />
        <img src="/image/Needle.png" alt="Needle" className="bg-image needle-bg" />
        <img src="/image/Needle.png" alt="Needle" className="bg-image needle-bg" />
        <img src="/image/Needle.png" alt="Needle" className="bg-image needle-bg" />
        <img src="/image/Needle.png" alt="Needle" className="bg-image needle-bg" />
        <img src="/image/Needle.png" alt="Needle" className="bg-image needle-bg" />
        <img src="/image/Needle.png" alt="Needle" className="bg-image needle-bg" />
        <img src="/image/plus.png" alt="Plus" className="bg-image plus-bg" />
        <img src="/image/plus.png" alt="Plus" className="bg-image plus-bg" />
        <img src="/image/plus.png" alt="Plus" className="bg-image plus-bg" />
        <img src="/image/plus.png" alt="Plus" className="bg-image plus-bg" />
        <img src="/image/plus.png" alt="Plus" className="bg-image plus-bg" />
        <img src="/image/plus.png" alt="Plus" className="bg-image plus-bg" />
        <img src="/image/plus.png" alt="Plus" className="bg-image plus-bg" />
        <img src="/image/plus.png" alt="Plus" className="bg-image plus-bg" />
        <img src="/image/Suitcase.png" alt="Suitcase" className="bg-image suitcase-bg" />
        <img src="/image/Suitcase.png" alt="Suitcase" className="bg-image suitcase-bg" />
        <img src="/image/Suitcase.png" alt="Suitcase" className="bg-image suitcase-bg" />
        <img src="/image/Suitcase.png" alt="Suitcase" className="bg-image suitcase-bg" />
        <img src="/image/Suitcase.png" alt="Suitcase" className="bg-image suitcase-bg" />
        <img src="/image/Suitcase.png" alt="Suitcase" className="bg-image suitcase-bg" />
        <img src="/image/Suitcase.png" alt="Suitcase" className="bg-image suitcase-bg" />
        <img src="/image/Suitcase.png" alt="Suitcase" className="bg-image suitcase-bg" />
      </div>
      <div className="person-container">
        <img src="/image/Person.png" alt="Person" className="person-image" />
      </div>
      <div className="landing-images">
        <img src="/image/Needle.png" alt="Needle" className="right-image needle-right" />
        <img src="/image/Needle.png" alt="Needle" className="right-image needle-right" />
        <img src="/image/Needle.png" alt="Needle" className="right-image needle-right" />
        <img src="/image/Needle.png" alt="Needle" className="right-image needle-right" />
        <img src="/image/Needle.png" alt="Needle" className="right-image needle-right" />
        <img src="/image/Needle.png" alt="Needle" className="right-image needle-right" />
        <img src="/image/Needle.png" alt="Needle" className="right-image needle-right" />
        <img src="/image/Needle.png" alt="Needle" className="right-image needle-right" />
        <img src="/image/plus.png" alt="Plus" className="right-image plus-right" />
        <img src="/image/plus.png" alt="Plus" className="right-image plus-right" />
        <img src="/image/plus.png" alt="Plus" className="right-image plus-right" />
        <img src="/image/plus.png" alt="Plus" className="right-image plus-right" />
        <img src="/image/plus.png" alt="Plus" className="right-image plus-right" />
        <img src="/image/plus.png" alt="Plus" className="right-image plus-right" />
        <img src="/image/plus.png" alt="Plus" className="right-image plus-right" />
        <img src="/image/plus.png" alt="Plus" className="right-image plus-right" />
        <img src="/image/Suitcase.png" alt="Suitcase" className="right-image suitcase-right" />
        <img src="/image/Suitcase.png" alt="Suitcase" className="right-image suitcase-right" />
        <img src="/image/Suitcase.png" alt="Suitcase" className="right-image suitcase-right" />
        <img src="/image/Suitcase.png" alt="Suitcase" className="right-image suitcase-right" />
        <img src="/image/Suitcase.png" alt="Suitcase" className="right-image suitcase-right" />
        <img src="/image/Suitcase.png" alt="Suitcase" className="right-image suitcase-right" />
        <img src="/image/Suitcase.png" alt="Suitcase" className="right-image suitcase-right" />
        <img src="/image/Suitcase.png" alt="Suitcase" className="right-image suitcase-right" />
      </div>
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
			If emergency services are available to you, <b>contact 911 or your local emergency number first</b>.
            </p>
            <p className="disclaimer-text">
              This application is for informational purposes only and should not replace professional medical advice or emergency services. This assistant offers general guidance only and cannot replace a healthcare professional or emergency services.
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
