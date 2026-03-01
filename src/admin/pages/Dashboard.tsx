import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
<<<<<<< HEAD
  const { token } = useAuth();
=======
  const { token, logout } = useAuth();
>>>>>>> 9d43ae4... feat: update project with latest local changes including admin pages, database, and server improvements
  const [stats, setStats] = useState({
    newContacts: 0,
    upcomingBookings: 0,
    subscribers: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
<<<<<<< HEAD
=======
        } else if (response.status === 401) {
          logout();
>>>>>>> 9d43ae4... feat: update project with latest local changes including admin pages, database, and server improvements
        }
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };

    fetchStats();
<<<<<<< HEAD
  }, [token]);
=======
  }, [token, logout]);
>>>>>>> 9d43ae4... feat: update project with latest local changes including admin pages, database, and server improvements

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-teal-500">
          <h3 className="text-gray-500 text-sm font-medium">New Contacts</h3>
<<<<<<< HEAD
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.newContacts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-medium">Upcoming Bookings</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.upcomingBookings}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm font-medium">Subscribers</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats.subscribers}</p>
=======
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats?.newContacts || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-medium">Upcoming Bookings</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats?.upcomingBookings || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm font-medium">Subscribers</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{stats?.subscribers || 0}</p>
>>>>>>> 9d43ae4... feat: update project with latest local changes including admin pages, database, and server improvements
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
