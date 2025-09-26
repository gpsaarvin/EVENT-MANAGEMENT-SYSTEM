'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import Link from 'next/link';

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [userRegistration, setUserRegistration] = useState(null);

  // Fetch event details
  useEffect(() => {
    const fetchEventData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Get event details
        const eventResponse = await axios.get(`/api/events/${id}`);
        setEvent(eventResponse.data.event);
        
        // Check if user is authenticated and if they are already registered
        if (status === 'authenticated') {
          try {
            const registrationResponse = await axios.get(`/api/registrations?eventId=${id}&userId=${session.user.id}`);
            if (registrationResponse.data.registrations.length > 0) {
              setRegistered(true);
              setUserRegistration(registrationResponse.data.registrations[0]);
            }
          } catch (err) {
            // Silently fail
            console.error('Failed to check registration status:', err);
          }
        }
      } catch (err) {
        console.error('Failed to fetch event:', err);
        setError('Failed to load event details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id && (status === 'authenticated' || status === 'unauthenticated')) {
      fetchEventData();
    }
  }, [id, status, session]);

  // Handle registration
  const handleRegister = async () => {
    if (status !== 'authenticated') {
      router.push('/auth/signin');
      return;
    }
    
    setRegistering(true);
    setError('');
    
    try {
      const registrationData = {
        eventId: id,
        name: session.user.name,
        email: session.user.email,
      };
      
      const response = await axios.post('/api/registrations', registrationData);
      setRegistered(true);
      setUserRegistration(response.data.registration);
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Failed to register for this event. Please try again later.');
    } finally {
      setRegistering(false);
    }
  };

  // Handle cancellation
  const handleCancel = async () => {
    if (!userRegistration) return;
    
    setRegistering(true);
    setError('');
    
    try {
      await axios.delete(`/api/registrations/${userRegistration._id}`);
      setRegistered(false);
      setUserRegistration(null);
    } catch (err) {
      console.error('Cancellation failed:', err);
      setError('Failed to cancel registration. Please try again later.');
    } finally {
      setRegistering(false);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
              <div className="mt-4">
                <div className="flex">
                  <Link href="/events" className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100">
                    Go back to events
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Event not found</h2>
          <p className="mt-4 text-lg text-gray-500">The event you are looking for does not exist or has been removed.</p>
          <div className="mt-6">
            <Link href="/events" className="text-base font-medium text-indigo-600 hover:text-indigo-500">
              View all events<span aria-hidden="true"> &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isEventFull = event.registeredCount >= event.capacity;
  const isWaitlisted = userRegistration && userRegistration.status === 'waitlisted';

  return (
    <div className="bg-white">
      {/* Hero banner */}
      <div className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-10">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20`}>
                {event.category}
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight">{event.title}</h1>
              <div className="mt-4 flex items-center text-white text-opacity-90">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="mr-4">{formatDate(event.date)}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{event.location}</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              {status === 'loading' ? (
                <div className="bg-white bg-opacity-20 rounded-lg py-3 px-5 flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                </div>
              ) : registered ? (
                <div className="bg-white bg-opacity-20 rounded-lg py-3 px-5">
                  <div className="flex items-center">
                    <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">You're registered</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={registering || status !== 'authenticated'}
                  className={`rounded-lg py-3 px-6 font-medium transition-all
                    ${isEventFull
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-white text-indigo-700 hover:bg-opacity-90'
                    }`}
                >
                  {registering
                    ? 'Processing...'
                    : status !== 'authenticated'
                    ? 'Sign in to Register'
                    : isEventFull
                    ? 'Join Waitlist'
                    : 'Register Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <div>
                <Link href="/" className="text-gray-500 hover:text-indigo-600">
                  Home
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
                <Link href="/events" className="ml-4 text-gray-500 hover:text-indigo-600">
                  Events
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                </svg>
                <span className="ml-4 text-gray-800 font-medium truncate max-w-xs">{event.title}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event image and details */}
          <div className="lg:col-span-2">
            {event.imageUrl ? (
              <img src={event.imageUrl} alt={event.title} className="rounded-lg w-full h-auto object-cover shadow-md" />
            ) : (
              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg h-72 flex items-center justify-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-4 mb-6">About the event</h2>
              <div className="prose prose-indigo max-w-none text-gray-600">
                <p>{event.description}</p>
              </div>
            </div>
          </div>

          {/* Sidebar with details */}
          <div>
            <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Event Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-indigo-50 rounded-lg">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <svg className="h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-indigo-800 font-medium uppercase">Date</p>
                    <p className="text-gray-700 font-medium">{formatDate(event.date)}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg className="h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-purple-800 font-medium uppercase">Time</p>
                    <p className="text-gray-700 font-medium">{event.startTime} - {event.endTime}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-blue-800 font-medium uppercase">Location</p>
                    <p className="text-gray-700 font-medium">{event.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-pink-50 rounded-lg">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                    <svg className="h-5 w-5 text-pink-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-pink-800 font-medium uppercase">Capacity</p>
                    <p className="text-gray-700 font-medium">{event.registeredCount} / {event.capacity} registered</p>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full" 
                           style={{ width: `${Math.min(100, (event.registeredCount / event.capacity) * 100)}%` }}></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-green-800 font-medium uppercase">Organizer</p>
                    <p className="text-gray-700 font-medium">{event.organizer}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                {status === 'loading' ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
                  </div>
                ) : registered ? (
                  <div className="space-y-4">
                    {isWaitlisted ? (
                      <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-100">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-semibold text-yellow-800">You are on the waitlist</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              <p>The event is currently at capacity. You'll be notified if a spot becomes available.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg bg-green-50 p-4 border border-green-100">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-semibold text-green-800">Registration Confirmed</h3>
                            <div className="mt-2 text-sm text-green-700">
                              <p>Your registration has been confirmed. We look forward to seeing you there!</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={handleCancel}
                      disabled={registering}
                      className="w-full py-3 px-4 border border-red-300 rounded-lg shadow-sm text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      {registering ? 'Processing...' : 'Cancel Registration'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={handleRegister}
                      disabled={registering || status !== 'authenticated'}
                      className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        isEventFull
                          ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 focus:ring-indigo-500'
                      } transition-all`}
                    >
                      {registering
                        ? 'Processing...'
                        : status !== 'authenticated'
                        ? 'Sign in to Register'
                        : isEventFull
                        ? 'Join Waitlist'
                        : 'Register for Event'}
                    </button>
                    
                    {isEventFull && (
                      <div className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md">
                        <svg className="inline-block h-5 w-5 mr-1 -mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        This event is at capacity. You can join the waitlist and will be notified if a spot becomes available.
                      </div>
                    )}
                    
                    {status !== 'authenticated' && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                        <Link href="/auth/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
                          Sign in
                        </Link>{' '}
                        or{' '}
                        <Link href="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                          create an account
                        </Link>{' '}
                        to register for this event.
                      </div>
                    )}
                  </div>
                )}
                
                {error && (
                  <div className="mt-4 rounded-lg bg-red-50 p-4 border border-red-100">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}