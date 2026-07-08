// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 text-white shadow-md px-4 py-3 flex justify-between items-center w-full">

      <div className="text-2xl font-bold tracking-tight">
        <Link to="/" className="hover:text-gray-300 transition-colors">
          <img src="cheers.png" alt="" className='bg-red-500 w-10' />EventHub
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <Link to="/" className="text-gray-300 hover:text-white font-medium transition-colors">
          Home
        </Link>

        {isLoggedIn ? (
          <>
            <Link to="/dashboard" className="text-gray-300 hover:text-white font-medium transition-colors">
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}