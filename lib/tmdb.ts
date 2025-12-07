// src/lib/tmdb.ts

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// Interface Definition:
// Defines the shape of the Movie object for type safety throughout the app.
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

// Service: Fetch popular movies from TMDB API
export async function getPopularMovies(): Promise<Movie[]> {
  // Validation: Ensure API key is present in environment variables
  if (!API_KEY) {
    throw new Error('TMDB_API_KEY is not defined in .env file');
  }

  // Fetch data with ISR (Incremental Static Regeneration)
  // Revalidate: Cache the response for 1 hour (3600 seconds)
  // Language is set to 'en-US' for global consistency
  const res = await fetch(
    `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`,
    { next: { revalidate: 3600 } }
  );

  // Error Handling: Check if the response status is OK (200-299)
  if (!res.ok) {
    throw new Error('Failed to fetch movie data from TMDB');
  }

  const data = await res.json();
  return data.results;
}

// Service: Fetch details for a specific movie by ID
// This will be used in the dynamic movie detail page
export async function getMovieDetail(id: string) {
  const res = await fetch(
    `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`
  );
  
  // If movie not found or error occurs, return null to handle it gracefully in UI
  if (!res.ok) return null;
  
  return res.json();
}