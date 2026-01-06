"use client";

import { useState, useTransition } from "react";
import { createReview } from "@/app/actions";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Image from "next/image";

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
                rating: 0 // Set to 0 as private rating is removed
            });

            if (result.success) {
                toast.success("Post created!");
                setTitle("");
                setContent("");
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
        <div className="bg-[#1A1A1B] border border-[#343536] rounded-md p-4 space-y-4">
            <div className="flex items-center gap-2 mb-2 border-b border-[#343536] pb-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800">
                    <Image
                        src={session.user?.image || `https://ui-avatars.com/api/?name=${session.user?.name || 'User'}&background=eab308&color=000`}
                        alt="User"
                        width={32}
                        height={32}
                    />
                </div>
                <h3 className="text-sm font-bold text-[#D7DADC]">Create a post</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#1A1A1B] border border-[#343536] rounded-md px-4 py-2 text-sm text-[#D7DADC] focus:outline-none focus:border-[#D7DADC]/30 font-medium"
                />

                <textarea
                    placeholder="Text (optional)"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={5}
                    className="w-full bg-[#1A1A1B] border border-[#343536] rounded-md px-4 py-2 text-sm text-[#D7DADC] focus:outline-none focus:border-[#D7DADC]/30 resize-none leading-relaxed"
                />

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-[#D7DADC] text-black px-6 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-[#EBEEF0] transition-all disabled:opacity-50"
                    >
                        {isPending ? "Posting..." : "Post"}
                    </button>
                </div>
            </form>
        </div>
    );
}
