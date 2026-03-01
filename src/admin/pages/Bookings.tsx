import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

interface Booking {
  id: number;
  service: string;
  date: string;
  time: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  status: string;
  created_at: string;
}

const Bookings = () => {
<<<<<<< HEAD
  const { token } = useAuth();
=======
  const { token, logout } = useAuth();
>>>>>>> 9d43ae4... feat: update project with latest local changes including admin pages, database, and server improvements
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
<<<<<<< HEAD
  }, [token]);
=======
  }, [token, logout]);
>>>>>>> 9d43ae4... feat: update project with latest local changes including admin pages, database, and server improvements

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/admin/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
<<<<<<< HEAD
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
=======
      console.log('Bookings response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Bookings data:', data);
        setBookings(data);
      } else if (response.status === 401) {
        logout(); // Token expired or invalid
>>>>>>> 9d43ae4... feat: update project with latest local changes including admin pages, database, and server improvements
      }
    } catch (error) {
      console.error('Failed to fetch bookings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
      }
    } catch (error) {
      console.error('Failed to update booking status', error);
    }
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;

<<<<<<< HEAD
=======
  if (bookings.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Bookings</h2>
        <div className="bg-white shadow-md rounded-lg p-6 text-center text-gray-500">
          No bookings found.
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

>>>>>>> 9d43ae4... feat: update project with latest local changes including admin pages, database, and server improvements
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Bookings</h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
<<<<<<< HEAD
                    {format(new Date(booking.date), 'MMM d, yyyy')}
=======
                    {formatDate(booking.date)}
>>>>>>> 9d43ae4... feat: update project with latest local changes including admin pages, database, and server improvements
                  </div>
                  <div className="text-sm text-gray-500">{booking.time}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{booking.client_name}</div>
                  <div className="text-sm text-gray-500">{booking.client_email}</div>
                  <div className="text-sm text-gray-500">{booking.client_phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {booking.service}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {booking.status !== 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      Confirm
                    </button>
                  )}
                  {booking.status !== 'cancelled' && (
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                      className="text-red-600 hover:text-red-900"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Bookings;
