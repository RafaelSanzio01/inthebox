"use client";

import { useState, useTransition, useEffect } from "react";
import { toggleWatched } from "@/app/actions";
import { useSession } from "next-auth/react";
import { useToast } from "./ToastProvider";

/**
 * QuickWatchedButton Component
 * Allows users to mark a movie as "Watched" directly from the card.
 */

interface QuickWatchedButtonProps {
    movieId: number;
    title: string;
    posterPath: string;
    isInitiallyWatched?: boolean;
}

export default function QuickWatchedButton({
    movieId,
    title,
    posterPath,
    isInitiallyWatched = false
}: QuickWatchedButtonProps) {
    const { data: session } = useSession();
    const [isPending, startTransition] = useTransition();
    const [isWatched, setIsWatched] = useState<boolean>(isInitiallyWatched);
    const { showToast } = useToast();

    // Sync state with props
    useEffect(() => {
        setIsWatched(isInitiallyWatched);
    }, [isInitiallyWatched]);

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

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
            className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center transition-all z-20 font-bold ${isWatched
                ? "bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20"
                : "bg-black/40 text-white/70 hover:bg-green-400 hover:text-black backdrop-blur-md border border-white/10"
                }`}
            title={isWatched ? "Marked as Watched" : "Mark as Watched"}
        >
            {isPending ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isWatched ? (
                "👁"
            ) : (
                "○"
            )}
        </button>
    );
}
