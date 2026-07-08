import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.get('/events/')
      .then((response) => {
        setEvents(response.data);
      })
      .catch((error) => console.error("Error fetching events:", error))
      .finally(() => setLoading(false));
  }, []);

  const handleBookTicket = async (eventId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await apiClient.post('/bookings/', { event_id: eventId });
      
      setAlert({ type: 'success', message: 'Ticket booked successfully! Check your Dashboard.' });
      
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setAlert({ type: 'error', message: 'You have already booked a ticket for this event!' });
      } else {
        setAlert({ type: 'error', message: 'Failed to book ticket.' });
      }
    }

    setTimeout(() => setAlert({ type: '', message: '' }), 3500);
  };

  if (loading) {
    return <div className="text-center mt-20 text-xl font-semibold text-gray-600">Loading upcoming events...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 relative">
      
      {alert.message && (
        <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-lg font-bold text-white z-50 transition-all ${alert.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {alert.message}
        </div>
      )}

      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Discover Amazing Events</h1>
        <p className="text-lg text-gray-600">Book your tickets for the best experiences in town.</p>
      </div>

      {events.length === 0 ? (
        <div className="text-center bg-white p-10 rounded-lg shadow">
          <h3 className="text-xl text-gray-500">No events are currently scheduled. Check back later!</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
              
              <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                <span className="text-6xl">🎟️</span>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{event.title}</h2>
                <p className="text-gray-600 mb-4 flex-grow">{event.description}</p>
                
                <div className="text-sm text-gray-500 mb-6 space-y-1">
                  <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                  <p><strong>Capacity:</strong> {event.capacity} seats</p>
                </div>
                
                <button
                  onClick={() => handleBookTicket(event.id)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded transition-colors"
                >
                  Book Ticket
                </button>
              </div>
              
            </div>
          ))}
          
        </div>
      )}
    </div>
  );
}