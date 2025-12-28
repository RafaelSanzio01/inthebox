import { getPopularTVShows, getTVShowsByGenre } from "@/lib/tmdb";
import { getWatchlistIds, getWatchedIds } from "@/app/actions";
import MovieRow from "@/components/MovieRow";

const TV_GENRES = [
    { id: 10759, name: "Action & Adventure" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 18, name: "Drama" },
    { id: 10765, name: "Sci-Fi & Fantasy" },
    { id: 9648, name: "Mystery" },
];

export default async function SeriesPage() {
    const popularSeries = await getPopularTVShows();

    // Fetch user lists in parallel
    const [watchlistIds, watchedIds] = await Promise.all([
        getWatchlistIds(),
        getWatchedIds()
    ]);

    const genreRows = await Promise.all(
        TV_GENRES.map(async (genre) => {
            const shows = await getTVShowsByGenre(genre.id);
            return {
                title: genre.name,
                items: shows,
            };
        })
    );

    return (
        <div className="py-8 space-y-8">
            <div className="px-4 md:px-8 mb-12 border-l-4 border-yellow-500">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                    Premium <span className="text-yellow-500">Series</span>
                </h1>
                <p className="text-gray-400 max-w-2xl text-lg">
                    Explore top-rated television shows, from gripped dramas to epic fantasies.
                </p>
            </div>

            <div className="pl-4 md:pl-8 space-y-4">
                <MovieRow
                    title="Popular TV Shows"
                    items={popularSeries}
                    watchlistIds={watchlistIds}
                    watchedIds={watchedIds}
                />

                {genreRows.map((row) => (
                    <MovieRow
                        key={row.title}
                        title={row.title}
                        items={row.items}
                        watchlistIds={watchlistIds}
                        watchedIds={watchedIds}
                    />
                ))}
            </div>
        </div>
    );
}
