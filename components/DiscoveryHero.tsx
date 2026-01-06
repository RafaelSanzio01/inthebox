"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getGenresList, fetchSurpriseMovie } from "@/app/actions";
import { useToast } from "./ToastProvider";
import Link from "next/link";
import Image from "next/image";

interface DiscoveryHeroProps {
    // any initial data if needed
}

export default function DiscoveryHero() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [isPending, startTransition] = useTransition();

    // Surprise Me States
    const [showSurprise, setShowSurprise] = useState(false);
    const [genres, setGenres] = useState<{ [key: number]: string }>({});
    const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
    const [suggestion, setSuggestion] = useState<any>(null);
    const [loadingSuggestion, setLoadingSuggestion] = useState(false);

    // Toast
    const { showToast } = useToast();

    // Load genres on mount
    useEffect(() => {
        getGenresList().then(setGenres).catch(err => console.error(err));
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        router.push(`/search?q=${encodeURIComponent(query)}`);
    };

    const toggleGenre = (id: number) => {
        setSelectedGenres(prev =>
            prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
        );
    };

    const handleSurprise = async () => {
        setLoadingSuggestion(true);
        try {
            const movie = await fetchSurpriseMovie(selectedGenres);
            if (movie) {
                setSuggestion(movie);
            } else {
                showToast("No movies found. Try selecting different categories.");
            }
        } catch (error) {
            console.error(error);
            showToast("Failed to fetch a surprise movie. Please try again.");
        } finally {
            setLoadingSuggestion(false);
        }
    };

    const closeSurprise = () => {
        setShowSurprise(false);
        setSuggestion(null);
        setSelectedGenres([]);
    };

    return (
        <div className="relative mb-12 rounded-3xl overflow-hidden mx-4 md:mx-8 bg-gradient-to-br from-yellow-500/10 via-gray-900 to-black border border-white/5 shadow-2xl">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/10 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 p-8 md:p-16 flex flex-col items-start justify-center min-h-[400px]">
                <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter uppercase leading-[0.9]">
                    Discover <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                        Your Next Box
                    </span>
                </h1>

                <p className="text-gray-400 max-w-lg text-lg font-medium mb-10 leading-relaxed">
                    Explore our curated library. Search for your favorite titles or let fate decide your next watch.
                </p>

                {/* ACTION ROW: Search + Surprise Button */}
                <div className="w-full max-w-2xl flex flex-col md:flex-row gap-4">

                    {/* SEARCH BAR */}
                    <form onSubmit={handleSearch} className="flex-1 relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-500 group-focus-within:text-yellow-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search movies, series, genres..."
                            className="block w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:bg-white/10 transition-all font-medium"
                        />
                    </form>

                    {/* SURPRISE ME BUTTON */}
                    <button
                        onClick={() => setShowSurprise(true)}
                        className="bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-yellow-400 transition-all shadow-lg shadow-white/5 flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                        <span>🎲</span> Surprise Me
                    </button>
                </div>
            </div>

            {/* SURPRISE ME OVERLAY / MODAL */}
            {showSurprise && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-200">
                    <div className="flex-1 overflow-y-auto p-8 md:p-12">

                        {/* Header with Close */}
                        <div className="flex justify-between items-center mb-8 max-w-6xl mx-auto w-full">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tight">
                                Unbox <span className="text-yellow-500">Curiosity</span>
                            </h2>
                            <button onClick={closeSurprise} className="text-gray-500 hover:text-white transition-colors p-2 bg-white/5 rounded-full hover:bg-white/20">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {!suggestion ? (
                            // STEP 1: SELECT GENRES
                            <div className="max-w-4xl mx-auto mt-12 md:mt-24">
                                <p className="text-gray-400 mb-6 text-lg text-center font-medium">Select a few categories to tailor your surprise, or leave empty for total chaos.</p>

                                <div className="flex flex-wrap gap-3 mb-12 justify-center">
                                    {Object.entries(genres).map(([id, name]) => {
                                        const isSelected = selectedGenres.includes(Number(id));
                                        return (
                                            <button
                                                key={id}
                                                onClick={() => toggleGenre(Number(id))}
                                                className={`px-6 py-3 rounded-full text-sm font-bold border transition-all ${isSelected
                                                    ? "bg-yellow-500 border-yellow-500 text-black shadow-lg shadow-yellow-500/25 scale-105"
                                                    : "bg-transparent border-white/20 text-gray-300 hover:border-white hover:text-white"
                                                    }`}
                                            >
                                                {name}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-center">
                                    <button
                                        onClick={handleSurprise}
                                        disabled={loadingSuggestion}
                                        className="bg-yellow-500 text-black text-xl font-black px-12 py-5 rounded-2xl hover:bg-yellow-400 hover:scale-105 transition-all shadow-2xl shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                                    >
                                        {loadingSuggestion ? "Unboxing..." : "Reveal Mystery Box 🎬"}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // STEP 2: SHOW RESULT
                            <div className="flex flex-col md:flex-row gap-12 items-center max-w-5xl mx-auto py-12">
                                {/* Result Poster */}
                                <div className="relative w-[300px] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0">
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w780${suggestion.poster_path}`}
                                        alt={suggestion.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* Result Details */}
                                <div className="flex-1 space-y-6 text-center md:text-left">
                                    <div>
                                        <h3 className="text-4xl md:text-5xl font-black text-white mb-2 leading-tight">
                                            {suggestion.title}
                                        </h3>
                                        <div className="flex items-center justify-center md:justify-start gap-4 text-gray-400 font-medium">
                                            <span>{suggestion.release_date?.split('-')[0]}</span>
                                            <span className="text-yellow-500">★ {suggestion.vote_average?.toFixed(1)}</span>
                                        </div>
                                    </div>

                                    <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
                                        {suggestion.overview?.slice(0, 300)}...
                                    </p>

                                    <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
                                        <Link
                                            href={`/movie/${suggestion.id}`}
                                            className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                        >
                                            View Details
                                        </Link>
                                        <button
                                            onClick={handleSurprise}
                                            disabled={loadingSuggestion}
                                            className="border border-white/20 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition-colors flex items-center gap-2 justify-center"
                                        >
                                            <span>↻</span> Try Another
                                        </button>
                                    </div>

                                    <button onClick={() => setSuggestion(null)} className="text-sm text-gray-500 underline hover:text-white mt-4 inline-block">
                                        Back to Categories
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
