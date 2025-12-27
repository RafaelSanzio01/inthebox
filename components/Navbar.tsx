// src/components/Navbar.tsx
"use client";

import Link from 'next/link';
import { signIn, signOut, useSession } from "next-auth/react";

// Component: Navigation Bar
export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-gray-900 text-white border-b border-gray-800">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        
        {/* Logo Area */}
        <Link href="/" className="text-2xl font-bold tracking-tighter hover:text-yellow-400 transition-colors">
          inthe<span className="text-yellow-400">Box</span>
        </Link>

        {/* Navigation Links (Hidden on mobile for simplicity) */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className="hover:text-gray-300 transition-colors">
            Home
          </Link>
          <Link href="#" className="hover:text-gray-300 transition-colors">
            Popular
          </Link>
        </div>

        {/* Auth Buttons Area */}
        <div className="flex items-center space-x-4">
          {session ? (
            // --- IF USER IS LOGGED IN ---
            <div className="flex items-center gap-4">
               {/* User Avatar */}
               {session.user?.image && (
                 <img 
                   src={session.user.image} 
                   alt="Profile" 
                   className="w-8 h-8 rounded-full border border-gray-600"
                 />
               )}
               
               {/* User Name */}
               <span className="text-sm text-gray-300 hidden sm:block">
                 {session.user?.name}
               </span>
               
               {/* Sign Out Button */}
               <button 
                 onClick={() => signOut()}
                 className="text-sm font-medium hover:text-red-400 transition-colors border border-gray-700 px-3 py-1 rounded hover:border-red-400"
               >
                 Sign Out
               </button>
            </div>
          ) : (
            // --- IF USER IS LOGGED OUT (Updated Section) ---
            <div className="flex items-center gap-3">
              {/* GitHub Button: Darker style */}
              <button 
                onClick={() => signIn("github")}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-semibold text-sm transition-colors border border-gray-700"
              >
                GitHub
              </button>

              {/* Google Button: White/Light style for contrast */}
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