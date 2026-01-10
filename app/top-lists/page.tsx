import { getTopRatedMovies, getTopRatedTV, getBestOfYear } from "@/lib/tmdb";
import { getWatchlistIds, getWatchedIds, getAllAverageRatings } from "@/app/actions";
import MovieRow from "@/components/MovieRow";

export default async function TopListsPage() {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    // Parallel fetching for speed
    const [
        topRatedMovies,
        topRatedTV,
        bestOfLastYear,
        bestOfTwoYearsAgo,
        watchlistIds,
        watchedIds
    ] = await Promise.all([
        getTopRatedMovies(),
        getTopRatedTV(),
        getBestOfYear(lastYear),
        getBestOfYear(lastYear - 1),
        getWatchlistIds(),
        getWatchedIds()
    ]);

    // Fetch community ratings
    const allMedia = [...topRatedMovies, ...topRatedTV, ...bestOfLastYear, ...bestOfTwoYearsAgo];
    const allIds = Array.from(new Set(allMedia.map(m => m.id)));
    const communityRatings = await getAllAverageRatings(allIds);

    return (
        <div className="min-h-screen bg-neutral-950 text-white pb-20">
            {/* Header */}
            <div className="relative h-[300px] w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-700/20 via-neutral-950/80 to-neutral-950 z-10" />
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center px-4">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
                        Hall of <span className="text-yellow-500">Fame</span>
                    </h1>
                    <p className="text-lg text-gray-300 max-w-2xl">
                        The highest-rated masterpieces of all time, curated by the global community.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 -mt-20 relative z-30 space-y-12">

                {/* All Time Favorites */}
                <div className="pl-2">
                    <MovieRow
                        title="⭐ Top Rated Movies (All Time)"
                        items={topRatedMovies}
                        watchlistIds={watchlistIds}
                        watchedIds={watchedIds}
                        communityRatings={communityRatings}
                    />
                </div>

                <div className="pl-2">
                    <MovieRow
                        title="📺 Top Rated TV Shows (All Time)"
                        items={topRatedTV}
                        watchlistIds={watchlistIds}
                        watchedIds={watchedIds}
                        communityRatings={communityRatings}
                    />
                </div>

                {/* Temporal Bests - Previous Years */}
                <div className="pl-2">
                    <MovieRow
                        title={`🏅 Best of ${lastYear}`}
                        items={bestOfLastYear}
                        watchlistIds={watchlistIds}
                        watchedIds={watchedIds}
                        communityRatings={communityRatings}
                    />
                </div>

                <div className="pl-2">
                    <MovieRow
                        title={`🏅 Best of ${lastYear - 1}`}
                        items={bestOfTwoYearsAgo}
                        watchlistIds={watchlistIds}
                        watchedIds={watchedIds}
                        communityRatings={communityRatings}
                    />
                </div>

            </div>
        </div>
    );
}
