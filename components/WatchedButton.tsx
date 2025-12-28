"use client";

import { useState, useTransition, useEffect } from "react";
import { toggleWatched, getWatchedIds } from "@/app/actions";
import { useSession } from "next-auth/react";
import { useToast } from "./ToastProvider";

/**
 * WatchedButton Component
 * Main button for movie/tv detail pages to track "Watched" status.
 */

interface WatchedButtonProps {
    movieId: number;
    title: string;
    posterPath: string;
}

export default function WatchedButton({ movieId, title, posterPath }: WatchedButtonProps) {
    const { data: session } = useSession();
    const [isPending, startTransition] = useTransition();
    const [isWatched, setIsWatched] = useState<boolean>(false);
    const { showToast } = useToast();

    // Check initial state
    useEffect(() => {
        if (session) {
            getWatchedIds().then(ids => {
                setIsWatched(ids.includes(movieId));
            });
        }
    }, [movieId, session]);

    const handleToggle = () => {
        if (!session) {
            alert("Please sign in to track your watched movies.");
            return;
        }

        startTransition(async () => {
            try {
                const result = await toggleWatched(movieId, title, posterPath);
                if (result.success) {
                    setIsWatched(!!result.marked);
                    showToast(result.message);
                } else {
                    showToast(result.message);
                }
            } catch (error) {
                showToast("An error occurred. Please try again.");
            }
        });
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2 ${isPending
                ? "bg-gray-700 cursor-not-allowed text-gray-400"
                : isWatched
                    ? "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/20"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md"
                }`}
        >
            {isPending ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isWatched ? (
                "✓ Watched"
            ) : (
                "👁 Mark as Watched"
            )}
        </button>
    );
}
