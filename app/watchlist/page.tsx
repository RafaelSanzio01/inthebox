// src/app/watchlist/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust path if needed
import { prisma } from "../../lib/prisma"; // Adjust path if needed (../../lib/prisma)
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default async function WatchlistPage() {
  // 1. Check if the user is authenticated
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    // If not logged in, redirect to login page
    redirect("/api/auth/signin");
  }

  // 2. Fetch the user's watchlist from the database
  // We first find the user by email, then get their watchlist items
  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    include: {
      watchlist: {
        orderBy: {
          addedAt: 'desc', // Show newest items first
        },
      },
    },
  });

  // Handle case where user is not found in DB (edge case)
  if (!user) {
    return <div className="text-white">User not found.</div>;
  }

  const watchlist = user.watchlist;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-yellow-500">
        My Watchlist
      </h1>

      {/* Empty State */}
      {watchlist.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-xl mb-4">
            Your watchlist is currently empty.
          </p>
          <Link 
            href="/" 
            className="bg-yellow-500 text-black px-6 py-2 rounded-full font-bold hover:bg-yellow-400 transition"
          >
            Explore Movies
          </Link>
        </div>
      ) : (
        /* Watchlist Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {watchlist.map((item) => (
            <Link key={item.id} href={`/movie/${item.movieId}`}>
              <div className="group cursor-pointer relative">
                
                {/* Poster Image */}
                <div className="relative overflow-hidden rounded-lg shadow-lg aspect-[2/3] border border-gray-800">
                  {item.posterPath ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                      alt={item.movieTitle || "Movie"}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                  
                  {/* Remove Button Overlay (Optional - Future Feature) */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-bold border border-white px-3 py-1 rounded-full">
                      View Details
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="mt-2 text-white font-medium truncate group-hover:text-yellow-500 transition-colors">
                  {item.movieTitle}
                </h3>
                <p className="text-gray-500 text-xs">
                    Added: {new Date(item.addedAt).toLocaleDateString()}
                </p>

              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}