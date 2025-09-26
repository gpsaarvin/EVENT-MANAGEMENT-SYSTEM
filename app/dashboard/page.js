'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import axios from 'axios';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRegistrations = async () => {
      if (status !== 'authenticated') return;
      
      setLoading(true);
      setError('');
      
      try {
        const response = await axios.get(`/api/registrations?userId=${session.user.id}`);
        setRegistrations(response.data.registrations);
      } catch (err) {
        console.error('Failed to fetch registrations:', err);
        setError('Failed to load your registrations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRegistrations();
  }, [session, status]);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Group registrations by status
  const groupedRegistrations = {
    upcoming: [],
    waitlisted: [],
    past: [],
    cancelled: []
  };
  
  if (registrations.length > 0) {
    const now = new Date();
    
    registrations.forEach(registration => {
      const eventDate = new Date(registration.eventId.date);
      
      if (registration.status === 'cancelled') {
        groupedRegistrations.cancelled.push(registration);
      } else if (registration.status === 'waitlisted') {
        groupedRegistrations.waitlisted.push(registration);
      } else if (eventDate < now) {
        groupedRegistrations.past.push(registration);
      } else {
        groupedRegistrations.upcoming.push(registration);
      }
    });
    
    // Sort by date
    const sortByDate = (a, b) => new Date(a.eventId.date) - new Date(b.eventId.date);
    
    groupedRegistrations.upcoming.sort(sortByDate);
    groupedRegistrations.waitlisted.sort(sortByDate);
    groupedRegistrations.past.sort((a, b) => new Date(b.eventId.date) - new Date(a.eventId.date)); // Past events in reverse
    groupedRegistrations.cancelled.sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate)); // Cancelled by most recent
  }

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-12 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-indigo-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="mt-5 text-2xl font-bold text-gray-900">Sign in Required</h2>
            <p className="mt-2 text-gray-600">Please sign in to view your dashboard and manage your events</p>
            <div className="mt-6">
              <Link 
                href="/auth/signin"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
              <p className="mt-2 text-indigo-100">Manage your event registrations and profile</p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Link 
                href="/events" 
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium bg-white text-indigo-700 hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-indigo-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse Events
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* User Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 text-center">
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-20 h-20 rounded-full mx-auto border-4 border-indigo-100"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      {(session.user.name || session.user.email || "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <h2 className="mt-4 text-xl font-bold text-gray-800">{session.user.name || "User"}</h2>
                <p className="text-gray-500">{session.user.email}</p>
                
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <p className="text-sm text-gray-500 font-medium">Account Type</p>
                  <p className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                    {session.user.role || 'Student'}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Member since</span>
                  <span className="text-gray-700 font-medium">
                    {new Date(session.user.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-white rounded-lg shadow-sm p-6 flex flex-col space-y-4">
              <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-2">Quick Links</h3>
              
              <Link href="/events" className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Browse Events
              </Link>
              
              <Link href="/" className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="rounded-md bg-red-50 p-4 border border-red-100">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            ) : registrations.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-indigo-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No Events Found</h3>
                <p className="mt-2 text-gray-500">You haven't registered for any events yet.</p>
                <div className="mt-6">
                  <Link 
                    href="/events" 
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90"
                  >
                    Browse available events
                    <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Upcoming Events */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Events</h3>
                  {groupedRegistrations.upcoming.length === 0 ? (
                    <p className="text-gray-500 py-4">No upcoming events.</p>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {groupedRegistrations.upcoming.map((registration) => (
                        <li key={registration._id} className="py-4">
                          <Link href={`/events/${registration.eventId._id}`} className="block hover:bg-gray-50 -mx-6 px-6 py-2 rounded-md transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <h4 className="font-medium text-indigo-600 truncate">{registration.eventId.title}</h4>
                                  <span className={`ml-2 px-2.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${
                                    registration.status === 'registered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {registration.status}
                                  </span>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    {registration.eventId.location}
                                  </div>
                                  <div className="flex items-center">
                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    <time dateTime={registration.eventId.date}>
                                      {formatDate(registration.eventId.date)}, {registration.eventId.startTime}
                                    </time>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-4">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              
                {/* Waitlisted Events */}
                {groupedRegistrations.waitlisted.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Waitlisted Events</h3>
                    <ul className="divide-y divide-gray-200">
                      {groupedRegistrations.waitlisted.map((registration) => (
                        <li key={registration._id} className="py-4">
                          <Link href={`/events/${registration.eventId._id}`} className="block hover:bg-gray-50 -mx-6 px-6 py-2 rounded-md transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <h4 className="font-medium text-indigo-600 truncate">{registration.eventId.title}</h4>
                                  <span className="ml-2 px-2.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full bg-yellow-100 text-yellow-800">
                                    waitlisted
                                  </span>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    {registration.eventId.location}
                                  </div>
                                  <div className="flex items-center">
                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    <time dateTime={registration.eventId.date}>
                                      {formatDate(registration.eventId.date)}, {registration.eventId.startTime}
                                    </time>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-4">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              
                {/* Past Events */}
                {groupedRegistrations.past.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Past Events</h3>
                    <ul className="divide-y divide-gray-200">
                      {groupedRegistrations.past.map((registration) => (
                        <li key={registration._id} className="py-4">
                          <Link href={`/events/${registration.eventId._id}`} className="block hover:bg-gray-50 -mx-6 px-6 py-2 rounded-md transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-600 truncate">{registration.eventId.title}</h4>
                                <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    {registration.eventId.location}
                                  </div>
                                  <div className="flex items-center">
                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    <time dateTime={registration.eventId.date}>
                                      {formatDate(registration.eventId.date)}, {registration.eventId.startTime}
                                    </time>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-4">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              
                {/* Cancelled Registrations */}
                {groupedRegistrations.cancelled.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Cancelled Registrations</h3>
                    <ul className="divide-y divide-gray-200">
                      {groupedRegistrations.cancelled.map((registration) => (
                        <li key={registration._id} className="py-4">
                          <Link href={`/events/${registration.eventId._id}`} className="block hover:bg-gray-50 -mx-6 px-6 py-2 rounded-md transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <h4 className="font-medium text-gray-600 truncate">{registration.eventId.title}</h4>
                                  <span className="ml-2 px-2.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full bg-gray-100 text-gray-800">
                                    cancelled
                                  </span>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    {registration.eventId.location}
                                  </div>
                                  <div className="flex items-center">
                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    <time dateTime={registration.eventId.date}>
                                      {formatDate(registration.eventId.date)}, {registration.eventId.startTime}
                                    </time>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-4">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}