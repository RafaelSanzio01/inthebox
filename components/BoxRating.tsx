"use client";

import { useState, useTransition } from "react";
import { rateMovie } from "@/app/actions";
import { toast } from "react-hot-toast";

interface BoxRatingProps {
    movieId: number;
    initialRating: number | null;
    averageRating: number;
    ratingCount: number;
}

export default function BoxRating({
    movieId,
    initialRating,
    averageRating,
    ratingCount
}: BoxRatingProps) {
    const [hoveredRating, setHoveredRating] = useState<number | null>(null);
    const [currentRating, setCurrentRating] = useState<number | null>(initialRating);
    const [isPending, startTransition] = useTransition();

    const handleRate = (value: number) => {
        if (isPending) return;

        startTransition(async () => {
            try {
                await rateMovie(movieId, value);
                setCurrentRating(value);
                toast.success("Rating saved!");
            } catch (error) {
                toast.error("Failed to save rating.");
            }
        });
    };

    return (
        <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        Box Rate
                        <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full border border-yellow-500/20">
                            Community
                        </span>
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                        {ratingCount > 0
                            ? `Average: ${averageRating.toFixed(1)} / 10 (${ratingCount} votes)`
                            : "No ratings yet. Be the first!"}
                    </p>
                </div>
                {currentRating && (
                    <div className="text-right">
                        <span className="text-sm text-gray-400">Your Vote</span>
                        <p className="text-2xl font-black text-yellow-500">{currentRating}</p>
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                    const isActive = (hoveredRating !== null ? num <= hoveredRating : currentRating !== null ? num <= currentRating : false);

                    return (
                        <button
                            key={num}
                            onMouseEnter={() => setHoveredRating(num)}
                            onMouseLeave={() => setHoveredRating(null)}
                            onClick={() => handleRate(num)}
                            disabled={isPending}
                            className={`
                flex-1 aspect-square rounded-md border-2 transition-all duration-200 flex items-center justify-center font-bold text-sm
                ${isActive
                                    ? "bg-yellow-500 border-yellow-500 text-black scale-105 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                                    : "bg-transparent border-white/20 text-white/40 hover:border-white/40 hover:text-white"
                                }
                ${isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
                        >
                            {num}
                        </button>
                    );
                })}
            </div>

            <div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-500 font-bold px-1">
                <span>Awful</span>
                <span>Masterpiece</span>
            </div>
        </div>
    );
}
