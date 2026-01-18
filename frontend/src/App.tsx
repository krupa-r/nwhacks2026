import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Landing from './pages/Landing';
import Main from './pages/Main';
import './styles/App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/main" element={<Main />} />
      </Routes>
    </Router>
  );
}

export default App;
