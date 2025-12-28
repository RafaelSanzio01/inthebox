"use client";

import Image from "next/image";
import Link from "next/link";
import QuickWatchlistButton from "./QuickWatchlistButton";
import QuickWatchedButton from "./QuickWatchedButton";
import { Media, getGenres } from "@/lib/tmdb";
import { useEffect, useRef, useState } from "react";

/**
 * MovieRow Component
 * A reusable horizontal scrolling row for displaying a collection of movies or TV shows.
 */

interface MediaRowProps {
    title: string;          // Row heading (e.g., "Trending Now")
    items: Media[];        // Array of Movie or TVShow objects
    watchlistIds?: number[]; // IDs already in user's watchlist for UI state
    watchedIds?: number[];   // IDs already marked as watched
    communityRatings?: Record<number, { average: number; count: number }>;
}

export default function MovieRow({ title, items, watchlistIds = [], watchedIds = [], communityRatings = {} }: MediaRowProps) {
    const rowRef = useRef<HTMLDivElement>(null);
    const [genreMap, setGenreMap] = useState<{ [key: number]: string }>({});

    // Load genre definitions once on mount to map IDs to Names (e.g., 28 -> Action)
    useEffect(() => {
        getGenres().then(setGenreMap);
    }, []);

    /**
     * Scroll Logic
     * Animates the horizontal scroll of the container based on the button clicked.
     */
    const scroll = (direction: "left" | "right") => {
        if (rowRef.current) {
            const { scrollLeft, clientWidth } = rowRef.current;
            const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
        }
    };

    return (
        <div className="mb-12 group/row">
            <h2 className="text-xl font-bold mb-4 px-4 md:px-0 text-white/90 group-hover/row:text-yellow-500 transition-colors">
                {title}
            </h2>

            <div className="relative overflow-hidden">
                {/* --- NAVIGATION BUTTONS --- */}
                <button
                    onClick={() => scroll("left")}
                    className="absolute left-0 top-0 bottom-0 w-12 z-40 bg-black/40 opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black/60 flex items-center justify-center text-white"
                >
                    {"<"}
                </button>

                {/* --- SCROLLABLE CONTAINER --- */}
                <div
                    ref={rowRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide px-4 md:px-0 scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {/* Filter out duplicate IDs to prevent React 'duplicate key' errors */}
                    {Array.from(new Map(items.map(item => [item.id, item])).values()).map((item) => {
                        // Handle naming differences between Movies (title) and TV (name)
                        const displayTitle = item.title || item.name;

                        // Decide folder prefix based on media type
                        const linkPrefix = item.media_type === 'tv' ? '/tv' : '/movie';

                        // Pick first 3 genres and translate their IDs to text
                        const itemGenres = item.genre_ids?.slice(0, 3).map(id => genreMap[id]).filter(Boolean) || [];

                        return (
                            <div
                                key={item.id}
                                className="relative flex-none w-[140px] md:w-[180px] group/item"
                            >
                                <Link href={`${linkPrefix}/${item.id}`}>
                                    <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-gray-900 border border-white/5 group-hover/item:border-yellow-500/50 transition-all duration-300 transform group-hover/item:scale-[1.02]">
                                        <Image
                                            src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                                            alt={displayTitle || "Poster"}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 140px, 180px"
                                        />

                                        {/* --- HOVER OVERLAY: Details shown on mouseover --- */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                            {/* Genre Tags */}
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {itemGenres.map((g, idx) => (
                                                    <span key={idx} className="text-[8px] bg-yellow-500/80 text-black px-1 rounded font-bold uppercase">
                                                        {g}
                                                    </span>
                                                ))}
                                            </div>
                                            <p className="text-white text-xs font-bold truncate">{displayTitle}</p>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-yellow-500 text-[10px] font-bold">★ {item.vote_average.toFixed(1)}</p>
                                                {communityRatings[item.id] && communityRatings[item.id].count > 0 && (
                                                    <p className="text-yellow-400 text-[10px] font-bold bg-yellow-500/10 px-1 rounded border border-yellow-500/20">
                                                        BOX {communityRatings[item.id].average.toFixed(1)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>

                                {/* --- QUICK ACTIONS: Like/Watchlist/Watched Buttons --- */}
                                <div className="md:opacity-0 group-hover/item:opacity-100 transition-opacity">
                                    <QuickWatchedButton
                                        movieId={item.id}
                                        title={displayTitle || ""}
                                        posterPath={item.poster_path}
                                        isInitiallyWatched={watchedIds.includes(item.id)}
                                    />
                                    <QuickWatchlistButton
                                        movieId={item.id}
                                        title={displayTitle || ""}
                                        posterPath={item.poster_path}
                                        isInitiallyInWatchlist={watchlistIds.includes(item.id)}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button
                    onClick={() => scroll("right")}
                    className="absolute right-0 top-0 bottom-0 w-12 z-40 bg-black/40 opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black/60 flex items-center justify-center text-white"
                >
                    {">"}
                </button>
            </div>
        </div>
    );
}
