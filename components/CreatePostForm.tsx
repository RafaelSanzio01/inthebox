"use client";

import { useState, useTransition } from "react";
import { createReview } from "@/app/actions";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface CreatePostFormProps {
    movieId: number;
    movieTitle: string;
    moviePoster: string;
    onSuccess?: () => void;
}

export default function CreatePostForm({ movieId, movieTitle, moviePoster, onSuccess }: CreatePostFormProps) {
    const { data: session } = useSession();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [rating, setRating] = useState(0);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) {
            toast.error("Please login to post");
            return;
        }
        if (!title.trim() || !content.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        startTransition(async () => {
            const result = await createReview({
                movieId,
                title,
                content,
                movieTitle,
                moviePoster,
                rating
            });

            if (result.success) {
                toast.success("Post created!");
                setTitle("");
                setContent("");
                setRating(0);
                if (onSuccess) onSuccess();
            } else {
                toast.error(result.message || "Failed to create post");
            }
        });
    };

    if (!session) {
        return (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
                <p className="text-gray-400 mb-4">You need to be logged in to share your thoughts.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-yellow-500">✍️</span> Share your thoughts
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <input
                        type="text"
                        placeholder="An interesting title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50 transition-colors font-bold"
                    />
                </div>

                <div className="space-y-2">
                    <textarea
                        placeholder="What did you think about this story?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={4}
                        className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50 transition-colors resize-none text-sm leading-relaxed"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Your Private Rating:</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setRating(num)}
                                    className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-all ${rating === num
                                            ? "bg-yellow-500 text-black scale-110 shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                                            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                        }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-yellow-500 text-black px-8 py-2.5 rounded-lg font-black text-sm uppercase tracking-wider hover:bg-yellow-400 transition-all disabled:opacity-50 shadow-lg shadow-yellow-500/10"
                    >
                        {isPending ? "Posting..." : "Post to Lounge"}
                    </button>
                </div>
            </form>
        </div>
    );
}
