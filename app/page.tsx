// src/app/page.tsx (ANA SAYFA)
import { getPopularMovies } from "../lib/tmdb";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const movies = await getPopularMovies();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-yellow-500">Popular Movies</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <Link href={`/movie/${movie.id}`} key={movie.id} className="group">
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
               <Image
                 src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                 alt={movie.title}
                 fill
                 className="object-cover group-hover:scale-105 transition-transform duration-300"
                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
               />
            </div>
            <h2 className="font-semibold truncate text-white">{movie.title}</h2>
            <p className="text-sm text-gray-400">Rating: {movie.vote_average}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}