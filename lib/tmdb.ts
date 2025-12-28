/**
 * TMDB API Library
 * This file handles all communication with The Movie Database API.
 * It includes type definitions, multi-page fetching logic, and category-specific queries.
 */

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

/**
 * Base Media Interface
 * Combining common fields between Movies and TV Shows for polymorphic usage.
 */
export interface Media {
  id: number;
  title?: string;          // Native to Movies
  name?: string;           // Native to TV Shows
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date?: string;   // Native to Movies
  first_air_date?: string; // Native to TV Shows
  media_type?: 'movie' | 'tv';
  genre_ids?: number[];    // Genre IDs for catalog pages
}

export interface Movie extends Media {
  title: string;
  release_date: string;
}

export interface TVShow extends Media {
  name: string;
  first_air_date: string;
}

/**
 * Helper: Fetch multiple pages in parallel
 * TMDB returns 20 items per page. To show more (e.g., 60), we fetch pages 1, 2, and 3 simultaneously.
 */
async function fetchMultiPage(url: string, pages: number = 3): Promise<any[]> {
  const requests = [];
  const separator = url.includes('?') ? '&' : '?';

  for (let i = 1; i <= pages; i++) {
    requests.push(
      fetch(`${url}${separator}page=${i}`, { next: { revalidate: 3600 } })
        .then(res => res.ok ? res.json() : { results: [] })
    );
  }

  const responses = await Promise.all(requests);
  return responses.flatMap(data => data.results);
}

/**
 * Genre Mapping Cache
 * We fetch all available genres once and cache them in memory during the runtime to avoid redundant API calls.
 */
let genresCache: { [key: number]: string } | null = null;

export async function getGenres(): Promise<{ [key: number]: string }> {
  if (genresCache) return genresCache;

  try {
    const [movieRes, tvRes] = await Promise.all([
      fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`),
      fetch(`${BASE_URL}/genre/tv/list?api_key=${API_KEY}&language=en-US`)
    ]);

    const movieData = await movieRes.json();
    const tvData = await tvRes.json();

    const genres: { [key: number]: string } = {};

    // Defensive check: Ensure genres property exists and is an array
    const allGenres = [
      ...(Array.isArray(movieData.genres) ? movieData.genres : []),
      ...(Array.isArray(tvData.genres) ? tvData.genres : [])
    ];

    allGenres.forEach((g: any) => {
      genres[g.id] = g.name;
    });

    genresCache = genres;
    return genres;
  } catch (error) {
    console.error("Failed to fetch genres:", error);
    return {}; // Return empty map as fallback to avoid breaking the UI
  }
}


/**
 * Fetch Cast & Crew
 * Returns the credits for a specific movie or TV show.
 */
export async function getCredits(type: 'movie' | 'tv', id: string) {
  const res = await fetch(`${BASE_URL}/${type}/${id}/credits?api_key=${API_KEY}&language=en-US`, { next: { revalidate: 3600 } });
  if (!res.ok) return { cast: [], crew: [] };
  return res.json();
}

// --- DATA FETCHING FUNCTIONS ---

export async function getPopularMovies(): Promise<Movie[]> {
  if (!API_KEY) throw new Error('TMDB_API_KEY is not defined');
  const results = await fetchMultiPage(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US`);
  return results.map((m: any) => ({ ...m, media_type: 'movie' }));
}

export async function getPopularTVShows(): Promise<TVShow[]> {
  const results = await fetchMultiPage(`${BASE_URL}/tv/popular?api_key=${API_KEY}&language=en-US`);
  return results.map((s: any) => ({ ...s, media_type: 'tv' }));
}

export async function getMonthlyPopularMovies(): Promise<Movie[]> {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&primary_release_date.gte=${firstDayOfMonth}&primary_release_date.lte=${lastDayOfMonth}`;
  const results = await fetchMultiPage(url);
  return results.map((m: any) => ({ ...m, media_type: 'movie' }));
}

export async function getMoviesByGenre(genreId: number): Promise<Movie[]> {
  const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&with_genres=${genreId}`;
  const results = await fetchMultiPage(url);
  return results.map((m: any) => ({ ...m, media_type: 'movie' }));
}

export async function getTVShowsByGenre(genreId: number): Promise<TVShow[]> {
  const url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&with_genres=${genreId}`;
  const results = await fetchMultiPage(url);
  return results.map((s: any) => ({ ...s, media_type: 'tv' }));
}

/**
 * Special Fetch: Anime
 * Filter: Genre 16 (Animation) and Original Language JP.
 */
export async function getAnime(): Promise<Media[]> {
  const url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&with_genres=16&with_original_language=ja`;
  const results = await fetchMultiPage(url);
  return results.map((s: any) => ({ ...s, media_type: 'tv' }));
}

/**
 * Special Fetch: Animations
 * Filter: Genre 16 (Animation).
 */
export async function getAnimations(): Promise<Media[]> {
  const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&with_genres=16`;
  const results = await fetchMultiPage(url);
  return results.map((m: any) => ({ ...m, media_type: 'movie' }));
}

/**
 * Trending All
 * Fetches common trending items (mixed movies and series).
 */
export async function getTrendings(): Promise<Media[]> {
  const res = await fetch(`${BASE_URL}/trending/all/week?api_key=${API_KEY}&language=en-US`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch trending');
  const data = await res.json();
  return data.results;
}

/**
 * Detailed Movie Data
 * Combining primary details and credits (cast/crew) in one object.
 */
export async function getMovieDetail(id: string) {
  const [movieRes, credits] = await Promise.all([
    fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`),
    getCredits('movie', id)
  ]);

  if (!movieRes.ok) return null;
  const movie = await movieRes.json();
  return { ...movie, media_type: 'movie', credits };
}

/**
 * Detailed TV Show Data
 */
export async function getTVDetail(id: string) {
  const [tvRes, credits] = await Promise.all([
    fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=en-US`),
    getCredits('tv', id)
  ]);

  if (!tvRes.ok) return null;
  const tv = await tvRes.json();
  return { ...tv, media_type: 'tv', credits };
}



