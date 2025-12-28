// src/app/movie/[id]/page.tsx
import { getMovieDetail } from "../../../lib/tmdb";
import Image from "next/image";
import WatchlistButton from "../../../components/WatchlistButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MovieDetailPage({ params }: PageProps) {
  // Await params for Next.js 15 compatibility
  const { id } = await params;
  const movie = await getMovieDetail(id);

  if (!movie) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-gray-900">
        <h1 className="text-2xl">Movie not found</h1>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-gray-900 text-white overflow-hidden">
      
      {/* --- BACKGROUND LAYER (Cinematic Backdrop) --- */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        
        {/* Use backdrop image if available, otherwise fallback to poster */}
        <Image
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path}`}
          alt="Cinema Backdrop"
          fill
          // Adjusted opacity to 75 for better visibility
          // Kept blur-[2.5px] to maintain focus on the content
          className="object-cover blur-[2.5px] opacity-75 scale-105"
        />

        {/* Gradient Overlay: Darkens the bottom and adds a subtle tint for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-black/40" />
      </div>

      {/* --- FOREGROUND CONTENT --- */}
      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col md:flex-row gap-10 items-start">
          
          {/* LEFT: Vertical Movie Poster */}
          <div className="relative w-full md:w-[350px] aspect-[2/3] flex-shrink-0 shadow-2xl rounded-xl overflow-hidden border border-white/10 transform hover:scale-105 transition-transform duration-500">
            <Image
              src={`https://image.tmdb.org/t/p/w780${movie.poster_path}`}
              alt={movie.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* RIGHT: Movie Details */}
          <div className="flex-1 space-y-8 mt-4 md:mt-0">
            
            {/* Title & Metadata */}
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-2xl">
                {movie.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mt-4 text-gray-200 font-medium">
                {/* Release Year */}
                <span className="bg-white/10 px-3 py-1 rounded-md backdrop-blur-md border border-white/10 shadow-sm">
                    {movie.release_date?.split("-")[0] || "N/A"}
                </span>
                
                {/* Rating Star */}
                <span className="flex items-center gap-1 text-yellow-400 drop-shadow-md">
                  <span className="text-xl">★</span>
                  <span className="font-bold text-white text-lg">
                    {movie.vote_average.toFixed(1)}
                  </span>
                </span>
              </div>
            </div>

            {/* Overview Section */}
            <div>
              <h3 className="text-2xl font-semibold text-white mb-3 drop-shadow-md">
                Overview
              </h3>
              <p className="text-gray-100 text-lg leading-relaxed max-w-3xl drop-shadow-lg font-medium opacity-95">
                {movie.overview}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-4">
              <WatchlistButton 
                movieId={movie.id} 
                title={movie.title} 
                posterPath={movie.poster_path} 
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}