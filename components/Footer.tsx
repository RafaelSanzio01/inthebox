// src/components/Footer.tsx
import Link from "next/link";

// Component: Page Footer
// Displays copyright info and secondary links at the bottom.
export default function Footer() {
  return (
    <footer className="bg-black text-gray-500 py-8 mt-auto border-t border-gray-800">
      <div className="container mx-auto px-4 text-center">
        <p className="mb-2">
          &copy; {new Date().getFullYear()} intheBox. All rights reserved.
        </p>
        <p className="text-sm">
          Built with <span className="text-white">Next.js</span>, <span className="text-white">Tailwind CSS</span> & <span className="text-white">TMDB API</span>.
        </p>
        
        <div className="mt-4 flex justify-center space-x-4 text-xs">
           <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
           <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}