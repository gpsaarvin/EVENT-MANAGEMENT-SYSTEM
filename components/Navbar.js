'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  
  // Close mobile menu on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav className="bg-white text-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <div className="h-10 w-10 rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                <span className="text-white text-xl font-bold">E</span>
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Eventmie</span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" 
                  className={`px-3 py-2 text-sm font-medium ${
                    pathname === '/' 
                      ? 'text-indigo-700 border-b-2 border-indigo-700' 
                      : 'text-gray-600 hover:text-indigo-700'
                  }`}>
                  Home
                </Link>
                <Link href="/events" 
                  className={`px-3 py-2 text-sm font-medium ${
                    pathname.startsWith('/events') 
                      ? 'text-indigo-700 border-b-2 border-indigo-700' 
                      : 'text-gray-600 hover:text-indigo-700'
                  }`}>
                  Events
                </Link>
                {session && (
                  <Link href="/dashboard" 
                    className={`px-3 py-2 text-sm font-medium ${
                      pathname.startsWith('/dashboard') 
                        ? 'text-indigo-700 border-b-2 border-indigo-700' 
                        : 'text-gray-600 hover:text-indigo-700'
                    }`}>
                    Dashboard
                  </Link>
                )}
                {session?.user?.role === 'admin' && (
                  <Link href="/admin" 
                    className={`px-3 py-2 text-sm font-medium ${
                      pathname.startsWith('/admin') 
                        ? 'text-indigo-700 border-b-2 border-indigo-700' 
                        : 'text-gray-600 hover:text-indigo-700'
                    }`}>
                    Admin
                  </Link>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {status === 'loading' ? (
                <div className="animate-pulse w-24 h-8 bg-gray-200 rounded"></div>
              ) : session ? (
                <div className="relative ml-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {session.user.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || "User"}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {(session.user.name || session.user.email || "U").charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700">{session.user.name || session.user.email}</span>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <Link 
                    href="/auth/signin"
                    className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/signup"
                    className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition-opacity"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-white shadow-lg absolute left-0 right-0 z-50`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/" 
            className={`block px-3 py-2 text-base font-medium ${
              pathname === '/' ? 'text-indigo-700 border-l-4 border-indigo-700 bg-indigo-50' : 'text-gray-600 hover:text-indigo-700 hover:bg-gray-50'
            }`}>
            Home
          </Link>
          <Link href="/events" 
            className={`block px-3 py-2 text-base font-medium ${
              pathname.startsWith('/events') ? 'text-indigo-700 border-l-4 border-indigo-700 bg-indigo-50' : 'text-gray-600 hover:text-indigo-700 hover:bg-gray-50'
            }`}>
            Events
          </Link>
          {session && (
            <Link href="/dashboard" 
              className={`block px-3 py-2 text-base font-medium ${
                pathname.startsWith('/dashboard') ? 'text-indigo-700 border-l-4 border-indigo-700 bg-indigo-50' : 'text-gray-600 hover:text-indigo-700 hover:bg-gray-50'
              }`}>
              Dashboard
            </Link>
          )}
          {session?.user?.role === 'admin' && (
            <Link href="/admin" 
              className={`block px-3 py-2 text-base font-medium ${
                pathname.startsWith('/admin') ? 'text-indigo-700 border-l-4 border-indigo-700 bg-indigo-50' : 'text-gray-600 hover:text-indigo-700 hover:bg-gray-50'
              }`}>
              Admin
            </Link>
          )}
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200 bg-gray-50">
          {session ? (
            <div className="px-5 py-3 space-y-3">
              <div className="flex items-center">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold">
                      {(session.user.name || session.user.email || "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{session.user.name || "User"}</div>
                  <div className="text-sm font-medium text-gray-500">{session.user.email}</div>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="block w-full text-center px-4 py-2 rounded-md text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition-opacity"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="px-5 py-3 space-y-3">
              <Link 
                href="/auth/signin"
                className="block w-full text-center px-4 py-2 rounded-md text-base font-medium text-indigo-600 border border-indigo-600"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/signup"
                className="block w-full text-center px-4 py-2 rounded-md text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition-opacity"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}