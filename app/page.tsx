// src/app/page.tsx (or app/page.tsx)

// CORRECTION: 'lib' is outside 'app', so we use '../' to go up one level.
import { getPopularMovies } from '../lib/tmdb'; 
import Image from 'next/image';
import Link from 'next/link';

// Home Component: Server Component responsible for fetching and displaying movies
export default async function Home() {
  // Fetch popular movies data from our service layer
  const movies = await getPopularMovies();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Popular Movies</h1>
      
      {/* Grid Layout: Responsive design (2 cols mobile, 4 cols desktop) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        
        {/* Map through the movies array */}
        {movies.map((movie) => (
          <Link href={`/movie/${movie.id}`} key={movie.id} className="group">
            
            {/* Movie Poster Card */}
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
               <Image
                 src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                 alt={movie.title}
                 fill // Fills the parent container
                 className="object-cover group-hover:scale-105 transition-transform duration-300"
                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
               />
            </div>

            {/* Movie Info */}
            <h2 className="font-semibold truncate">{movie.title}</h2>
            <p className="text-sm text-gray-500">Rating: {movie.vote_average}</p>
          
          </Link>
        ))}
      </div>
    </div>
  );
}