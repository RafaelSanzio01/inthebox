"use client";

import { useState, useTransition, useEffect } from "react";
import { addToWatchlist, removeFromWatchlist } from "@/app/actions";
import { useSession } from "next-auth/react";
import { useToast } from "./ToastProvider";

interface QuickWatchlistButtonProps {
    movieId: number;
    title: string;
    posterPath: string;
    isInitiallyInWatchlist?: boolean;
    mediaType?: string;
}

export default function QuickWatchlistButton({
    movieId,
    title,
    posterPath,
    isInitiallyInWatchlist = false,
    mediaType = "movie"
}: QuickWatchlistButtonProps) {
    const { data: session } = useSession();
    const [isPending, startTransition] = useTransition();
    const [isInWatchlist, setIsInWatchlist] = useState<boolean>(isInitiallyInWatchlist);
    const { showToast } = useToast();

    // Update internal state if the prop changes (important for batch updates)
    useEffect(() => {
        setIsInWatchlist(isInitiallyInWatchlist);
    }, [isInitiallyInWatchlist]);

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            alert("Please sign in to manage your watchlist.");
            return;
        }

        startTransition(async () => {
            try {
                if (isInWatchlist) {
                    const result = await removeFromWatchlist(movieId, mediaType);
                    if (result.success) {
                        setIsInWatchlist(false);
                        showToast(
                            `"${title}" removed from watchlist.`,
                            "Undo",
                            async () => {
                                const undoResult = await addToWatchlist(movieId, title, posterPath, mediaType);
                                if (undoResult.success) setIsInWatchlist(true);
                            }
                        );
                    }
                } else {
                    const result = await addToWatchlist(movieId, title, posterPath, mediaType);
                    if (result.success) {
                        setIsInWatchlist(true);
                        showToast(`"${title}" added to watchlist.`);
                    }
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
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all z-50 font-bold ${isInWatchlist
                ? "bg-yellow-500 text-black hover:bg-red-600 hover:text-white"
                : "bg-black/60 text-white hover:bg-yellow-500 hover:text-black backdrop-blur-md"
                }`}
            title={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
        >
            {isPending ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isInWatchlist ? (
                "✓"
            ) : (
                "+"
            )}
        </button>
    );
}
