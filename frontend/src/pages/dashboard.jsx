// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';

export default function Dashboard() {
    const [currentUser, setCurrentUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [events, setEvents] = useState([]);
    const [myHostedEvents, setMyHostedEvents] = useState([]); // NEW: Hosted events state
    const [loading, setLoading] = useState(true);

    const [showEventForm, setShowEventForm] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', capacity: '' });
    const [formError, setFormError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch User Profile, Bookings, and All Events simultaneously
                const [userRes, bookingsRes, eventsRes] = await Promise.all([
                    apiClient.get('/users/me'),
                    apiClient.get('/bookings/me'),
                    apiClient.get('/events/')
                ]);

                const user = userRes.data;
                const allEvents = eventsRes.data;

                setCurrentUser(user);
                setBookings(bookingsRes.data);
                setEvents(allEvents);

                // NEW: If the user is an organizer, find their specific events
                if (user.role === 'organizer') {
                    const hosted = allEvents.filter(e => e.organizer_id === user.id);
                    setMyHostedEvents(hosted);
                }

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const getEventDetails = (eventId) => events.find((e) => e.id === eventId);

    // --- ACTIONS ---
    const handleCancelTicket = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this ticket?")) return;
        try {
            await apiClient.delete(`/bookings/${bookingId}`);
            setBookings(bookings.filter((b) => b.id !== bookingId));
        } catch (error) {
            alert("Failed to cancel ticket.");
        }
    };

    // NEW: Cancel an Event (Organizer Only)
    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm("DANGER: Are you sure you want to cancel and delete this event entirely?")) return;
        try {
            await apiClient.delete(`/events/${eventId}`);
            // Remove it from both lists in the UI instantly
            setMyHostedEvents(myHostedEvents.filter((e) => e.id !== eventId));
            setEvents(events.filter((e) => e.id !== eventId));
        } catch (error) {
            alert("Failed to delete event. You can only delete events you created.");
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setFormError('');
        try {
            const payload = { ...newEvent, date: new Date(newEvent.date).toISOString(), capacity: parseInt(newEvent.capacity) };
            const response = await apiClient.post('/events/', payload);

            alert('Event created successfully!');
            setShowEventForm(false);
            setNewEvent({ title: '', description: '', date: '', capacity: '' });

            // Update both UI lists instantly
            setEvents([...events, response.data]);
            setMyHostedEvents([...myHostedEvents, response.data]);

        } catch (error) {
            setFormError('Failed to create event. Please check your inputs.');
        }
    };

    if (loading) {
        return <div className="text-center mt-20 text-xl font-semibold text-gray-600">Loading your dashboard...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto mt-8 px-4 pb-12">

            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-1">
                        Welcome, {currentUser?.full_name || 'User'}
                    </h1>
                    <p className="text-gray-600">
                        Account Type: <span className="font-semibold uppercase text-indigo-600">{currentUser?.role}</span>
                    </p>
                </div>

                {currentUser?.role === 'organizer' && (
                    <button onClick={() => setShowEventForm(!showEventForm)} className="mt-4 md:mt-0 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition-colors shadow">
                        {showEventForm ? 'Close Panel' : '➕ Create Event'}
                    </button>
                )}
            </div>

            {/* CREATE EVENT FORM */}
            {showEventForm && (
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-t-4 border-green-500">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Post a New Event</h2>
                    {formError && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{formError}</div>}
                    <form onSubmit={handleCreateEvent} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Event Title</label>
                            <input type="text" required value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} className="w-full px-4 py-2 border rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea required rows="2" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} className="w-full px-4 py-2 border rounded"></textarea>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Date & Time</label>
                                <input type="datetime-local" required value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} className="w-full px-4 py-2 border rounded" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Capacity</label>
                                <input type="number" min="1" required value={newEvent.capacity} onChange={(e) => setNewEvent({ ...newEvent, capacity: e.target.value })} className="w-full px-4 py-2 border rounded" />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded mt-2">Publish Event</button>
                    </form>
                </div>
            )}

            {/* GRID LAYOUT FOR SECTIONS */}
            <div className={`grid grid-cols-1 ${currentUser?.role === 'organizer' ? 'lg:grid-cols-2 gap-8' : ''}`}>

                {/* SECTION 1: MY TICKETS (Everyone sees this) */}
                <div className="bg-white rounded-lg shadow p-6 h-fit">
                    <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-4">🎫 My Tickets</h2>

                    {bookings.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-gray-500 mb-4">You haven't booked any tickets yet!</p>
                            <Link to="/" className="text-blue-600 hover:underline font-semibold">Browse Events</Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookings.map((booking) => {
                                const event = getEventDetails(booking.event_id);
                                if (!event) return null;
                                return (
                                    <div key={booking.id} className="flex justify-between items-center border rounded p-4">
                                        <div>
                                            <h3 className="font-bold text-gray-800">{event.title}</h3>
                                            <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                                        </div>
                                        <button onClick={() => handleCancelTicket(booking.id)} className="text-red-600 hover:text-red-800 text-sm font-semibold">Cancel</button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* SECTION 2: ORGANIZER'S EVENTS (Only Organizers see this) */}
                {currentUser?.role === 'organizer' && (
                    <div className="bg-gray-50 rounded-lg shadow p-6 h-fit border border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800 border-b border-gray-300 pb-4 mb-4">🎤 Events I'm Hosting</h2>

                        {myHostedEvents.length === 0 ? (
                            <div className="text-center py-6">
                                <p className="text-gray-500">You haven't created any events yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myHostedEvents.map((event) => (
                                    <div key={event.id} className="bg-white flex flex-col justify-between border rounded p-4 shadow-sm">
                                        <div className="mb-3">
                                            <h3 className="font-bold text-lg text-gray-800">{event.title}</h3>
                                            <p className="text-sm text-gray-500">Capacity: {event.capacity} people</p>
                                        </div>
                                        <div className="flex justify-end space-x-3 border-t pt-3">
                                            <button
                                                onClick={() => handleDeleteEvent(event.id)}
                                                className="bg-red-100 text-red-700 hover:bg-red-200 py-1 px-3 rounded text-sm font-semibold transition-colors"
                                            >
                                                Delete Event
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}