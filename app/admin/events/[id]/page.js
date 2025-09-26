'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';

export default function EditEvent({ params }) {
  const { id } = params;
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    capacity: 50,
    category: 'general',
    imageUrl: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [showRegistrations, setShowRegistrations] = useState(false);
  
  useEffect(() => {
    const fetchEvent = async () => {
      if (status !== 'authenticated' || session?.user?.role !== 'admin') return;
      
      setLoading(true);
      setError('');
      
      try {
        const response = await axios.get(`/api/events/${id}`);
        const event = response.data.event;
        
        // Format the date for the date input (YYYY-MM-DD)
        const formattedDate = new Date(event.date).toISOString().split('T')[0];
        
        setFormData({
          ...event,
          date: formattedDate
        });
      } catch (err) {
        console.error('Failed to fetch event:', err);
        setError('Failed to load event. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvent();
  }, [id, session, status]);
  
  useEffect(() => {
    const fetchRegistrations = async () => {
      if (status !== 'authenticated' || session?.user?.role !== 'admin') return;
      
      try {
        const response = await axios.get(`/api/registrations?eventId=${id}`);
        setRegistrations(response.data.registrations);
      } catch (err) {
        console.error('Failed to fetch registrations:', err);
      }
    };
    
    if (showRegistrations) {
      fetchRegistrations();
    }
  }, [id, showRegistrations, session, status]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (status !== 'authenticated' || session?.user?.role !== 'admin') {
      setError('You must be an admin to update events.');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      await axios.put(`/api/events/${id}`, formData);
      router.push('/admin');
    } catch (err) {
      console.error('Failed to update event:', err);
      setError(err.response?.data?.error || 'Failed to update event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }
  
  if (status === 'unauthenticated' || !session?.user?.role || session.user.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Access denied</h2>
          <p className="mt-4 text-lg text-gray-500">You don't have permission to access this page.</p>
          <div className="mt-6">
            <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">Edit Event</h1>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link href="/admin" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Back to Admin
            </Link>
          </div>
        </div>
        
        <div className="mt-8">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow overflow-hidden sm:rounded-lg p-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Event Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-600">*</span>
              </label>
              <textarea
                name="description"
                id="description"
                rows={5}
                required
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                  Capacity <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  name="capacity"
                  id="capacity"
                  min="1"
                  required
                  value={formData.capacity}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Current registrations: {formData.registeredCount || 0}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                  Start Time <span className="text-red-600">*</span>
                </label>
                <input
                  type="time"
                  name="startTime"
                  id="startTime"
                  required
                  value={formData.startTime}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                  End Time <span className="text-red-600">*</span>
                </label>
                <input
                  type="time"
                  name="endTime"
                  id="endTime"
                  required
                  value={formData.endTime}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="location"
                id="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category <span className="text-red-600">*</span>
              </label>
              <select
                name="category"
                id="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="general">General</option>
                <option value="academic">Academic</option>
                <option value="social">Social</option>
                <option value="cultural">Cultural</option>
                <option value="sports">Sports</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                Image URL
              </label>
              <input
                type="url"
                name="imageUrl"
                id="imageUrl"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <p className="mt-1 text-sm text-gray-500">Leave blank for default image</p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Registrations</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Total registrations: {formData.registeredCount || 0}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowRegistrations(!showRegistrations)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {showRegistrations ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          {showRegistrations && (
            <div className="border-t border-gray-200">
              {registrations.length === 0 ? (
                <div className="px-4 py-5 sm:px-6 text-gray-500 text-center">
                  No registrations found for this event.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                          User
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Registration Date
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {registrations.map((registration) => (
                        <tr key={registration._id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                            <div className="font-medium text-gray-900">
                              {registration.userDetails?.name || 'Unknown User'}
                            </div>
                            <div className="text-gray-500">
                              {registration.userDetails?.email || registration.userId}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              registration.status === 'registered' 
                                ? 'bg-green-100 text-green-800' 
                                : registration.status === 'waitlisted'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}>
                              {registration.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatDate(registration.registrationDate)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {registration.status === 'waitlisted' && (
                              <button
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                onClick={async () => {
                                  try {
                                    await axios.put(`/api/registrations/${registration._id}`, {
                                      status: 'registered'
                                    });
                                    
                                    // Refresh registrations
                                    const response = await axios.get(`/api/registrations?eventId=${id}`);
                                    setRegistrations(response.data.registrations);
                                    
                                    // Refresh event data
                                    const eventResponse = await axios.get(`/api/events/${id}`);
                                    const event = eventResponse.data.event;
                                    const formattedDate = new Date(event.date).toISOString().split('T')[0];
                                    setFormData({
                                      ...event,
                                      date: formattedDate
                                    });
                                  } catch (err) {
                                    console.error('Failed to update registration:', err);
                                    alert('Failed to update registration. Please try again.');
                                  }
                                }}
                              >
                                Move to Registered
                              </button>
                            )}
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={async () => {
                                if (confirm('Are you sure you want to cancel this registration?')) {
                                  try {
                                    await axios.delete(`/api/registrations/${registration._id}`);
                                    
                                    // Refresh registrations
                                    const response = await axios.get(`/api/registrations?eventId=${id}`);
                                    setRegistrations(response.data.registrations);
                                    
                                    // Refresh event data
                                    const eventResponse = await axios.get(`/api/events/${id}`);
                                    const event = eventResponse.data.event;
                                    const formattedDate = new Date(event.date).toISOString().split('T')[0];
                                    setFormData({
                                      ...event,
                                      date: formattedDate
                                    });
                                  } catch (err) {
                                    console.error('Failed to delete registration:', err);
                                    alert('Failed to delete registration. Please try again.');
                                  }
                                }
                              }}
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}