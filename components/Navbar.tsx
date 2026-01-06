// src/components/Navbar.tsx
"use client";

import Link from 'next/link';
import { signIn, signOut, useSession } from "next-auth/react";

import Logo from './Logo';

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
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-sm font-medium hover:text-yellow-400 transition-colors">
            Discover
          </Link>
          <Link href="/popular" className="text-sm font-medium hover:text-yellow-400 transition-colors">
            Popular
          </Link>
          <Link href="/series" className="text-sm font-medium hover:text-yellow-400 transition-colors">
            Series
          </Link>
          <Link href="/lounge" className="text-sm font-medium hover:text-yellow-400 transition-colors">
            Box Lounge
          </Link>
        </div>


        {/* 3. AUTH & ACTIONS AREA (Right) */}
        <div className="flex items-center space-x-4">
          {session ? (
            // === LOGGED IN STATE ===
            <div className="flex items-center gap-4">

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
              <button
                onClick={() => signIn("github")}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-semibold text-sm transition-colors border border-gray-700"
              >
                GitHub
              </button>
              <button
                onClick={() => signIn("google")}
                className="bg-white hover:bg-gray-200 text-black px-4 py-2 rounded-md font-semibold text-sm transition-colors"
              >
                Google
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}