// src/components/WatchlistButton.tsx
"use client";

import { useState, useTransition } from "react";
import { addToWatchlist } from "@/app/actions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface WatchlistButtonProps {
  movieId: number;
  title: string;
  posterPath: string;
}

export default function WatchlistButton({ movieId, title, posterPath }: WatchlistButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>("");

  const handleAddToWatchlist = () => {
    // If not logged in, redirect to login or show alert
    if (!session) {
      alert("Please sign in to add movies to your watchlist.");
      return;
    }

    // Call the Server Action
    startTransition(async () => {
      try {
        const result = await addToWatchlist(movieId, title, posterPath);
        setMessage(result.message);
      } catch (error) {
        setMessage("An error occurred. Please try again.");
      }
    });
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleAddToWatchlist}
        disabled={isPending}
        className={`px-6 py-2 rounded-full font-bold transition-colors ${
          isPending
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-yellow-500 hover:bg-yellow-400 text-black"
        }`}
      >
        {isPending ? "Adding..." : "+ Add to Watchlist"}
      </button>

      {/* Feedback Message */}
      {message && (
        <p className="mt-2 text-sm text-gray-300">
          {message}
        </p>
      )}
    </div>
  );
}