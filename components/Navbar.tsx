// src/components/Navbar.tsx
"use client";

import Link from 'next/link';
import { signIn, signOut, useSession } from "next-auth/react";

import Logo from './Logo';

import ThemeToggle from './ThemeToggle';

// Component: Navigation Bar
export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-black/80 backdrop-blur-md text-white border-b border-gray-800/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">

        {/* 1. LOGO AREA */}
        <Link href="/" className="transition-opacity hover:opacity-90">
          <Logo />
        </Link>

        {/* 2. MAIN NAVIGATION (Middle) */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium hover:text-yellow-400 transition-colors">
            {/* Discover Icon (Sparkles) */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
            <span>Discover</span>
          </Link>
          <Link href="/popular" className="flex items-center gap-1.5 text-sm font-medium hover:text-yellow-400 transition-colors">
            {/* Popular Icon (Flame) */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
            </svg>
            <span>Popular</span>
          </Link>
          <Link href="/series" className="flex items-center gap-1.5 text-sm font-medium hover:text-yellow-400 transition-colors">
            {/* Series Icon (TV) */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
            <span>Series</span>
          </Link>
          <Link href="/top-lists" className="flex items-center gap-1.5 text-sm font-medium hover:text-yellow-400 transition-colors">
            {/* Top Lists Icon (Trophy) */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0V5.625a2.25 2.25 0 1 1 4.5 0v3.375a2.25 2.25 0 1 1-4.5 0ZM9.497 4.5v3.375a2.25 2.25 0 0 1-4.5 0V5.625a2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
            <span>Top Lists</span>
          </Link>
          <Link href="/lounge" className="flex items-center gap-1.5 text-sm font-medium hover:text-yellow-400 transition-colors">
            {/* Lounge Icon (Discussion) */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
            <span>Box Lounge</span>
          </Link>
        </div>


        {/* 3. AUTH & ACTIONS AREA (Right) */}
        <div className="flex items-center space-x-4">
          {session ? (
            // === LOGGED IN STATE ===
            <div className="flex items-center gap-4">
              {/* THEME TOGGLE */}
              <ThemeToggle />

              {/* NEW: Watchlist Button with Icon */}
              {/* Placed here because it is a "User Action" */}
              <Link
                href="/watchlist"
                className="group flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-800 transition-all"
                title="My Watchlist"
              >
                {/* Heart SVG Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-gray-400 group-hover:text-red-500 transition-colors"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>

                {/* Text (Visible only on large screens) */}
                <span className="hidden lg:block text-sm font-medium text-gray-300 group-hover:text-white">
                  Watchlist
                </span>
              </Link>

              {/* Profile Link */}
              <Link
                href="/profile"
                className="group flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-800 transition-all"
                title="My Profile"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">👤</span>
                <span className="hidden lg:block text-sm font-medium text-gray-300 group-hover:text-white">
                  Profile
                </span>
              </Link>

              {/* Divider Line */}
              <div className="h-6 w-px bg-gray-700 hidden sm:block"></div>

              {/* User Info */}
              <div className="flex items-center gap-3">
                {session.user?.image && (
                  <img
                    src={session.user.image}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border border-gray-600 shadow-sm"
                  />
                )}
                <span className="text-sm font-medium text-white hidden sm:block">
                  {session.user?.name?.split(' ')[0]}
                </span>
              </div>


              {/* Sign Out Button (Icon style for mobile, text for desktop could be an option, kept simple here) */}
              <button
                onClick={() => signOut()}
                className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-2 py-1 rounded transition-colors ml-2"
              >
                Log out
              </button>
            </div>
          ) : (
            // === GUEST STATE ===
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => signIn()}
                className="bg-white hover:bg-gray-200 text-black px-6 py-2 rounded-md font-semibold text-sm transition-colors shadow-lg hover:shadow-xl"
              >
                Sign In
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}