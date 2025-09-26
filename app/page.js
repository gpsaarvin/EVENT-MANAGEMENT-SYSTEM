'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const router = useRouter();
  
  // Categories
  const categories = ['Academic', 'Cultural', 'Sports', 'Technology', 'Other'];
  
  const handleSearch = (e) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (searchQuery) {
      params.append('query', searchQuery);
    }
    if (category) {
      params.append('category', category);
    }
    
    router.push(`/events?${params.toString()}`);
  };

  return (
    <div className="bg-white">
      {/* Hero Banner Section - inspired by Eventmie */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center mix-blend-overlay"></div>
        
        <div className="relative container mx-auto px-6 py-32 md:py-40 lg:py-48">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Discover Amazing Events
            </h1>
            <p className="text-xl text-white opacity-90 mb-10 leading-relaxed">
              Join exciting events, connect with people, and create unforgettable experiences
            </p>
            
            {/* Search Form */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow">
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div className="md:w-1/3">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <button 
                    type="submit"
                    className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-md hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Browse by Category</h2>
            <p className="mt-4 text-lg text-gray-600">Find the perfect event that matches your interests</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat, index) => (
              <Link 
                key={cat} 
                href={`/events?category=${cat}`}
                className="group"
              >
                <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                  <div className={`h-40 w-full relative bg-gradient-to-r ${
                    cat === 'Academic' ? 'from-blue-500 to-blue-700' :
                    cat === 'Cultural' ? 'from-pink-500 to-rose-600' :
                    cat === 'Sports' ? 'from-green-500 to-emerald-700' :
                    cat === 'Technology' ? 'from-purple-500 to-indigo-700' :
                    'from-gray-500 to-gray-700'
                  }`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">{cat}</span>
                    </div>
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{cat} Events</h3>
                    <p className="text-gray-600 text-sm">Explore all {cat.toLowerCase()} events</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600">Simple steps to discover and attend events</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mb-6">
                <span className="text-white text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Browse Events</h3>
              <p className="text-gray-600">Discover events that match your interests from our extensive collection</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mb-6">
                <span className="text-white text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Register & Pay</h3>
              <p className="text-gray-600">Secure your spot with our easy registration and payment process</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center mb-6">
                <span className="text-white text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Attend & Enjoy</h3>
              <p className="text-gray-600">Get event reminders and enjoy an amazing experience</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">What Our Users Say</h2>
            <p className="mt-4 text-lg text-gray-300">Don't just take our word for it</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className="text-sm text-gray-400">Student</p>
                </div>
              </div>
              <p className="italic text-gray-300">"Finding and registering for campus events has never been easier. I love how I can discover events that match my interests!"</p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Michael Thompson</h4>
                  <p className="text-sm text-gray-400">Club President</p>
                </div>
              </div>
              <p className="italic text-gray-300">"Managing our club events and registrations has become so much more efficient. We've seen attendance increase by 30% since using this platform."</p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold">Emily Rodriguez</h4>
                  <p className="text-sm text-gray-400">Faculty Member</p>
                </div>
              </div>
              <p className="italic text-gray-300">"As a faculty advisor, I appreciate the detailed analytics and ease of promoting our academic events to students across campus."</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Ready to Discover Amazing Events?
          </h2>
          <p className="text-xl text-white opacity-90 mb-10 max-w-3xl mx-auto">
            Join our community today and never miss out on exciting events happening around you
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              href="/auth/signin"
              className="px-8 py-4 bg-white text-indigo-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Sign In with Google
            </Link>
            <Link 
              href="/events" 
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              Browse Events
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
