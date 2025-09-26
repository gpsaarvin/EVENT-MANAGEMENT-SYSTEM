'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Categories
  const categories = ['Academic', 'Cultural', 'Sports', 'Technology', 'Other'];
  
  // Cities - you can expand this list as needed
  const cities = [
    { city: 'New York', state: 'NY' },
    { city: 'Los Angeles', state: 'CA' },
    { city: 'Chicago', state: 'IL' },
    { city: 'Houston', state: 'TX' },
    { city: 'Phoenix', state: 'AZ' }
  ];

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError('');
      
      try {
        const query = searchParams.get('query') || '';
        const categoryFilter = searchParams.get('category') || '';
        const cityFilter = searchParams.get('city') || '';
        
        setSearchQuery(query);
        setCategory(categoryFilter);
        setCity(cityFilter);
        
        const response = await axios.get(`/api/events?query=${query}&category=${categoryFilter}&city=${cityFilter}`);
        setEvents(response.data.events);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [searchParams]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (searchQuery) {
      params.append('query', searchQuery);
    }
    if (category) {
      params.append('category', category);
    }
    if (city) {
      params.append('city', city);
    }
    
    router.push(`/events?${params.toString()}`);
  };
  
  // Format date
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'EEEE, MMMM do, yyyy');
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Discover Amazing Events
          </h1>
          <p className="mt-4 text-xl text-white opacity-90 max-w-2xl mx-auto">
            Find and register for exciting events happening around you
          </p>
        </div>
      </div>
      
      {/* Search Form - Inspired by Eventmie */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg shadow-lg bg-white p-6 -mt-10 relative z-10 border border-gray-100">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Events</label>
              <input
                type="text"
                id="search"
                name="search"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Search by event name or keyword"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                id="category"
                name="category"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <select
                id="city"
                name="city"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="">All Cities</option>
                {cities.map((city, index) => (
                  <option key={index} value={city.city}>
                    {city.city}, {city.state}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-4 mt-4 flex justify-center">
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                Search Events
              </button>
            </div>
          </form>
        </div>
        
        {/* Events List Section */}
        <div className="py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
            <p className="mt-2 text-lg text-gray-600">Register now before seats fill up</p>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4 max-w-2xl mx-auto">
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
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l.707.707L15.414 4a1 1 0 01.707 1.707l-.707.707.707.707a1 1 0 01-1.414 1.414L14 7.828l-.707.707a1 1 0 11-1.414-1.414l.707-.707-.707-.707A1 1 0 0112 4h.172l.707-.707A1 1 0 0113 3z" clipRule="evenodd" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No events found</h3>
              <p className="mt-2 text-sm text-gray-500">Try adjusting your search criteria or check back later for new events.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <div key={event._id} className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="relative h-48 w-full bg-gray-200">
                    {event.imageUrl ? (
                      <Image 
                        src={event.imageUrl} 
                        alt={event.title} 
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-500">
                        <span className="text-white text-xl font-bold">{event.title.substring(0, 2)}</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        event.category === 'Academic' ? 'bg-blue-100 text-blue-800' :
                        event.category === 'Cultural' ? 'bg-pink-100 text-pink-800' :
                        event.category === 'Sports' ? 'bg-green-100 text-green-800' :
                        event.category === 'Technology' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {event.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <svg className="h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-2 text-sm text-gray-600">{formatDate(event.date)}</span>
                    </div>
                    
                    <Link href={`/events/${event._id}`}>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-300">{event.title}</h3>
                    </Link>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                    
                    <div className="flex items-center mb-4">
                      <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-2 text-sm text-gray-600">{event.location}</span>
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-2 text-sm text-gray-600">{event.startTime} - {event.endTime}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold">{event.registeredCount || 0}</span> / <span>{event.capacity}</span> registered
                      </div>
                      
                      <Link
                        href={`/events/${event._id}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}