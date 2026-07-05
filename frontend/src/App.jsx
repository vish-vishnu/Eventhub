// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/navbar';
import Home from './pages/home';
import Login from './pages/login';
import Signup from './pages/signup';
import Dashboard from './pages/dashboard';

function App() {
  return (
    <Router>
      {/* The Navbar sits OUTSIDE the Routes so it appears on every single page */}
      <Navbar />
      
      {/* The main container keeps everything centered and looking clean */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <Routes>
          {/* When the URL is '/', load the Home page */}
          <Route path="/" element={<Home />} />
          
          {/* When the URL is '/login', load the Login page */}
          <Route path="/login" element={<Login />} />
          
          <Route path="/signup" element={<Signup />} />

          {/* When the URL is '/dashboard', load the Dashboard page */}
          <Route path="/dashboard" element={<Dashboard />} />

        </Routes>
      </main>
    </Router>
  );
}

export default App;