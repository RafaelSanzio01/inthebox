import { getPopularMovies, getPopularTVShows, getAnime, getAnimations, getTrendings } from "@/lib/tmdb";
import { getWatchlistIds, getWatchedIds, getAllAverageRatings } from "@/app/actions";
import MovieRow from "@/components/MovieRow";
import DiscoveryHero from "@/components/DiscoveryHero";

/**
 * Simplified shuffle function
 * Randomizes the order of items in an array for "Recommended" or "Curated" sections.
 */
function shuffle(array: any[]) {
  return array.sort(() => Math.random() - 0.5);
}

export default async function HomePage() {
  /**
   * Data Parallelization
   * We trigger all different category fetches simultaneously to reduce the total wait time.
   * Total time = Time of the slowest request, rather than Sum of all requests.
   */
  // Fetch Trending (Weekly) for Discovery
  const [trendingMovies, trendingTV] = await Promise.all([
    getTrendings("movie", "week"),
    getTrendings("tv", "week")
  ]);

  // Combine and shuffle slightly to keep it dynamic but relevant
  const discoveryContent = shuffle([...trendingMovies, ...trendingTV]).slice(0, 40);

  const [popularMovies, popularTV, anime, animations] = await Promise.all([
    getPopularMovies(),
    getPopularTVShows(),
    getAnime(),
    getAnimations()
  ]);

  // Fetch current user's lists to highlight items
  const [watchlistIds, watchedIds] = await Promise.all([
    getWatchlistIds(),
    getWatchedIds()
  ]);

  // Collect all movie IDs to fetch community ratings in one go
  const allMovies = [...discoveryContent, ...popularMovies, ...popularTV, ...anime, ...animations];
  const allMovieIds = Array.from(new Set(allMovies.map(m => m.id)));
  const communityRatings = await getAllAverageRatings(allMovieIds);

  // Create some "Curated" random sections
  const hiddenGems = shuffle([...popularMovies, ...popularTV]).slice(0, 40);

  return (
    <div className="py-8 space-y-8">

      {/* HERO SECTION: Discovery & Surprise */}
      <DiscoveryHero />

      {/* CONTENT ROWS: Different categories displayed as horizontal sliders */}
      <div className="pl-4 md:pl-8 space-y-4">
        {/* Pass fetched data to MovieRow components */}
        <MovieRow title="Trending This Week" items={discoveryContent} watchlistIds={watchlistIds} watchedIds={watchedIds} communityRatings={communityRatings} />
        <MovieRow title="Popular Series" items={popularTV.slice(0, 50)} watchlistIds={watchlistIds} watchedIds={watchedIds} communityRatings={communityRatings} />
        <MovieRow title="Anime Series" items={anime.slice(0, 50)} watchlistIds={watchlistIds} watchedIds={watchedIds} communityRatings={communityRatings} />
        <MovieRow title="Animated Movies" items={animations.slice(0, 50)} watchlistIds={watchlistIds} watchedIds={watchedIds} communityRatings={communityRatings} />
        <MovieRow title="Hidden Gems" items={hiddenGems} watchlistIds={watchlistIds} watchedIds={watchedIds} communityRatings={communityRatings} />
      </div>
    </div>
  );
}
