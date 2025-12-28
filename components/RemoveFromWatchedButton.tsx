"use client";

import { useTransition } from "react";
import { removeFromWatched, addToWatched } from "@/app/actions";
import { useToast } from "./ToastProvider";

interface RemoveFromWatchedButtonProps {
    movieId: number;
    title: string;
    posterPath: string;
}

export default function RemoveFromWatchedButton({ movieId, title, posterPath }: RemoveFromWatchedButtonProps) {
    const [isPending, startTransition] = useTransition();
    const { showToast } = useToast();

    const handleRemove = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent Link navigation
        e.stopPropagation();

        startTransition(async () => {
            try {
                const result = await removeFromWatched(movieId);
                if (result.success) {
                    showToast(
                        `"${title}" removed from watched history.`,
                        "Undo",
                        async () => {
                            try {
                                await addToWatched(movieId, title, posterPath);
                            } catch (err) {
                                console.error("Failed to undo removal:", err);
                            }
                        }
                    );
                }
            } catch (error) {
                console.error("Failed to remove movie:", error);
            }
        });
    };

    return (
        <button
            onClick={handleRemove}
            disabled={isPending}
            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-black/70 hover:bg-red-600 text-white rounded-full transition-colors z-20 font-bold"
            title="Remove from watched history"
        >
            {isPending ? "..." : "×"}
        </button>
    );
}
