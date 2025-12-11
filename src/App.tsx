import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MenuChallengeApp from './MenuChallengeApp';
import Dashboard from './Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MenuChallengeApp />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;