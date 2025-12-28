"use client";

import { useState, useTransition, useEffect } from "react";
import { addToWatchlist, removeFromWatchlist, checkIsInWatchlist } from "@/app/actions";
import { useSession } from "next-auth/react";
import { useToast } from "./ToastProvider";

interface WatchlistButtonProps {
  movieId: number;
  title: string;
  posterPath: string;
}

export default function WatchlistButton({ movieId, title, posterPath }: WatchlistButtonProps) {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [isInWatchlist, setIsInWatchlist] = useState<boolean>(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (session) {
      checkIsInWatchlist(movieId).then(setIsInWatchlist);
    }
  }, [movieId, session]);

  const handleToggleWatchlist = () => {
    if (!session) {
      alert("Please sign in to manage your watchlist.");
      return;
    }

    startTransition(async () => {
      try {
        if (isInWatchlist) {
          const result = await removeFromWatchlist(movieId);
          if (result.success) {
            setIsInWatchlist(false);
            showToast(
              `"${title}" removed from watchlist.`,
              "Undo",
              async () => {
                const undoResult = await addToWatchlist(movieId, title, posterPath);
                if (undoResult.success) setIsInWatchlist(true);
              }
            );
          }
        } else {
          const result = await addToWatchlist(movieId, title, posterPath);
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
    <div className="mt-4">
      <button
        onClick={handleToggleWatchlist}
        disabled={isPending}
        className={`px-6 py-2 rounded-full font-bold transition-colors ${isPending
          ? "bg-gray-500 cursor-not-allowed"
          : isInWatchlist
            ? "bg-red-600 hover:bg-red-500 text-white"
            : "bg-yellow-500 hover:bg-yellow-400 text-black"
          }`}
      >
        {isPending
          ? (isInWatchlist ? "Removing..." : "Adding...")
          : (isInWatchlist ? "- Remove from Watchlist" : "+ Add to Watchlist")}
      </button>
    </div>
  );
}
