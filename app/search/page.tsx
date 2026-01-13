import { searchMulti } from "@/lib/tmdb";
import Link from "next/link";
import Image from "next/image";
import { getMovieRating, getAverageRating } from "@/app/actions";

import SearchInput from "@/components/SearchInput";

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q: string }>;
}) {
    const { q } = await searchParams;
    const query = q || "";
    const results = query ? await searchMulti(query) : [];

    return (
        <div className="min-h-screen bg-black text-white py-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                    {/* Search Input for New Search */}
                    <div className="mb-8">
                        <SearchInput initialQuery={query} className="max-w-2xl" placeholder="Search again..." />
                    </div>

                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">
                        Search Results for <span className="text-yellow-500">"{query}"</span>
                    </h1>

                    <p className="text-gray-400">
                        Found {results.length} matches in movies and TV shows.
                    </p>
                </div>

                {results.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <p className="text-gray-500 text-xl">No results found. Try a different keyword.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {results.map((item) => {
                            let link = "";
                            if (item.media_type === 'movie') link = `/movie/${item.id}`;
                            else if (item.media_type === 'tv') link = `/tv/${item.id}`;
                            else if (item.media_type === 'person') link = `/person/${item.id}`;

                            const title = item.title || item.name;
                            const imagePath = item.media_type === 'person' ? item.profile_path : item.poster_path;
                            const date = item.release_date || item.first_air_date;
                            const rating = item.media_type === 'person' ? item.popularity?.toFixed(0) : item.vote_average?.toFixed(1);
                            const label = item.media_type === 'person' ? "Pop" : "★";

                            return (
                                <Link key={item.id} href={link} className="group">
                                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-900 border border-white/10 group-hover:border-yellow-500/50 transition-all duration-300">
                                        {imagePath ? (
                                            <Image
                                                src={`https://image.tmdb.org/t/p/w500${imagePath}`}
                                                alt={title || "Poster"}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600 font-bold">
                                                No Image
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 transition-transform">
                                            <p className="text-white font-bold truncate text-sm">{title}</p>
                                            <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                                                <span>{item.media_type === 'person' ? item.known_for_department : (date?.split('-')[0] || "N/A")}</span>
                                                <span className="text-yellow-500 font-bold">{label} {rating}</span>
                                            </div>
                                        </div>

                                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
                                            {item.media_type}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
