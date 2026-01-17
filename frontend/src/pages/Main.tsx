import React from 'react';
import '../styles/Main.css';

const Main: React.FC = () => {
  return (
    <div className="main-container">
      <div className="main-content">
        <h1 className="main-title">Main Page</h1>
        <p className="main-description">
          Welcome to the main page. This is where users can ask their emergency health related questions.
        </p>
      </div>
    </div>
  );
};

export default Main;
