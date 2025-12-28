import { getPopularMovies, getPopularTVShows, getAnime, getAnimations, getTrendings } from "@/lib/tmdb";
import { getWatchlistIds, getWatchedIds } from "@/app/actions";
import MovieRow from "@/components/MovieRow";

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
  const [popularMovies, popularTV, anime, animations, trending] = await Promise.all([
    getPopularMovies(),
    getPopularTVShows(),
    getAnime(),
    getAnimations(),
    getTrendings()
  ]);

  // Fetch current user's lists to highlight items
  const [watchlistIds, watchedIds] = await Promise.all([
    getWatchlistIds(),
    getWatchedIds()
  ]);

  // Create some "Curated" random sections by mixing and shuffling existing data
  const forYou = shuffle([...trending]).slice(0, 40);
  const hiddenGems = shuffle([...popularMovies, ...popularTV]).slice(0, 40);

  return (
    <div className="py-8 space-y-8">

      {/* --- HERO SECTION: Featured Banner --- */}
      <div className="px-4 md:px-8 mb-12 relative overflow-hidden rounded-2xl mx-4 md:mx-8 bg-gradient-to-br from-yellow-500/20 to-transparent p-12 border border-yellow-500/10">
        <div className="relative z-10">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight uppercase">
            Discover <br />
            Your <span className="text-yellow-500">Next Box</span>
          </h1>
          <p className="text-gray-300 max-w-xl text-xl font-medium mb-8">
            Personalized suggestions based on what's hot and what's unique. Dive into our curated selections.
          </p>
          <div className="flex gap-4">
            <button className="bg-yellow-500 text-black px-8 py-3 rounded-full font-bold hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20">
              Surprise Me
            </button>
          </div>
        </div>
      </div>

      {/* --- CONTENT ROWS: Different categories displayed as horizontal sliders --- */}
      <div className="pl-4 md:pl-8 space-y-4">
        {/* Pass fetched data to MovieRow components */}
        <MovieRow title="Trending Now" items={forYou} watchlistIds={watchlistIds} watchedIds={watchedIds} />
        <MovieRow title="Popular Series" items={popularTV.slice(0, 50)} watchlistIds={watchlistIds} watchedIds={watchedIds} />
        <MovieRow title="Anime" items={anime.slice(0, 50)} watchlistIds={watchlistIds} watchedIds={watchedIds} />
        <MovieRow title="Animations" items={animations.slice(0, 50)} watchlistIds={watchlistIds} watchedIds={watchedIds} />
        <MovieRow title="Hidden Gems" items={hiddenGems} watchlistIds={watchlistIds} watchedIds={watchedIds} />
      </div>
    </div>
  );
}
