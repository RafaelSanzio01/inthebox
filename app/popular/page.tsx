import { getMonthlyPopularMovies, getMoviesByGenre, getAnimations, getAnime } from "@/lib/tmdb";
import { getWatchlistIds, getWatchedIds, getAllAverageRatings } from "@/app/actions";
import MovieRow from "@/components/MovieRow";

const GENRES = [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 18, name: "Drama" },
    { id: 14, name: "Fantasy" },
    { id: 27, name: "Horror" },
    { id: 9648, name: "Mystery" },
    { id: 10749, name: "Romance" },
];

export default async function PopularPage() {
    const monthlyPopular = await getMonthlyPopularMovies();
    const popularAnime = await getAnime();
    const popularAnimations = await getAnimations();

    // Fetch user lists in parallel
    const [watchlistIds, watchedIds] = await Promise.all([
        getWatchlistIds(),
        getWatchedIds()
    ]);

    const genreRows = await Promise.all(
        GENRES.map(async (genre) => {
            const movies = await getMoviesByGenre(genre.id);
            return {
                title: genre.name,
                items: movies.slice(0, 50),
            };
        })
    );

    // Collect all unique IDs to fetch ratings in one go
    const allItems = [
        ...monthlyPopular,
        ...popularAnime,
        ...popularAnimations,
        ...genreRows.flatMap(row => row.items)
    ];
    const allIds = Array.from(new Set(allItems.map(item => item.id)));
    const communityRatings = await getAllAverageRatings(allIds);

    return (
        <div className="py-8 space-y-4">
            <div className="px-4 md:px-8 mb-12 border-l-4 border-yellow-500">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                    Trending <span className="text-yellow-500">Movies</span>
                </h1>
                <p className="text-gray-400 max-w-2xl text-lg">
                    The most popular motion pictures of the month.
                </p>
            </div>

            <div className="pl-4 md:pl-8 space-y-2">
                <MovieRow
                    title="Popular This Month"
                    items={monthlyPopular.slice(0, 50)}
                    watchlistIds={watchlistIds}
                    watchedIds={watchedIds}
                    communityRatings={communityRatings}
                />
                <MovieRow
                    title="Anime"
                    items={popularAnime.slice(0, 50)}
                    watchlistIds={watchlistIds}
                    watchedIds={watchedIds}
                    communityRatings={communityRatings}
                />
                <MovieRow
                    title="Animations"
                    items={popularAnimations.slice(0, 50)}
                    watchlistIds={watchlistIds}
                    watchedIds={watchedIds}
                    communityRatings={communityRatings}
                />
                {genreRows.map((row) => (
                    <MovieRow
                        key={row.title}
                        title={row.title}
                        items={row.items}
                        watchlistIds={watchlistIds}
                        watchedIds={watchedIds}
                        communityRatings={communityRatings}
                    />
                ))}
            </div>
        </div>
    );
}
