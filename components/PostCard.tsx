"use client";

import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { toggleUpvote, addComment } from "@/app/actions";
import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface PostCardProps {
    post: any;
    showMovieInfo?: boolean;
}

export default function PostCard({ post, showMovieInfo = true }: PostCardProps) {
    const { data: session } = useSession();
    const [upvotes, setUpvotes] = useState(post.upvotes);
    const [isPending, startTransition] = useTransition();
    const [showComments, setShowComments] = useState(false);
    const [commentContent, setCommentContent] = useState("");

    const handleUpvote = async () => {
        if (!session) {
            toast.error("Please login to upvote");
            return;
        }
        startTransition(async () => {
            try {
                await toggleUpvote(post.id);
                setUpvotes((prev: number) => prev + 1);
                toast.success("Upvoted!");
            } catch (error) {
                toast.error("Failed to upvote");
            }
        });
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) {
            toast.error("Please login to comment");
            return;
        }
        if (!commentContent.trim()) return;

        startTransition(async () => {
            try {
                await addComment(post.id, commentContent);
                setCommentContent("");
                toast.success("Comment added!");
                // Note: Real-time update would need a state for comments list
            } catch (error) {
                toast.error("Failed to add comment");
            }
        });
    };

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors">
            <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-800">
                            {post.user.image ? (
                                <Image src={post.user.image} alt={post.user.name} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">👤</div>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">{post.user.name}</p>
                            <p className="text-[10px] text-gray-500">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                    </div>

                    {showMovieInfo && post.movieId && (
                        <Link
                            href={`/movie/${post.movieId}`}
                            className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded-lg border border-white/5 hover:border-yellow-500/30 transition-colors"
                        >
                            {post.moviePoster && (
                                <img
                                    src={`https://image.tmdb.org/t/p/w92${post.moviePoster}`}
                                    alt={post.movieTitle}
                                    className="w-6 h-9 object-cover rounded shadow-lg"
                                />
                            )}
                            <span className="text-[10px] font-bold text-gray-400 truncate max-w-[100px]">
                                {post.movieTitle}
                            </span>
                        </Link>
                    )}
                </div>

                {/* Content */}
                <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-lg font-bold text-white">{post.title}</h3>
                        {post.rating > 0 && (
                            <span className="text-xs font-black text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">
                                {post.rating}
                            </span>
                        )}
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {post.content}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-2">
                    <button
                        onClick={handleUpvote}
                        disabled={isPending}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isPending ? "opacity-50" : "hover:bg-yellow-500/10 hover:text-yellow-500 text-gray-400"
                            }`}
                    >
                        <span className="text-lg">▲</span>
                        {upvotes}
                    </button>

                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                    >
                        <span className="text-lg">💬</span>
                        {post.comments.length}
                    </button>
                </div>

                {/* Comment Section (Simplified) */}
                {showComments && (
                    <div className="mt-4 pt-4 border-t border-gray-800 space-y-4">
                        <form onSubmit={handleAddComment} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Write a comment..."
                                value={commentContent}
                                onChange={(e) => setCommentContent(e.target.value)}
                                className="flex-1 bg-black/40 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={isPending}
                                className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50"
                            >
                                Post
                            </button>
                        </form>

                        <div className="space-y-3">
                            {post.comments.map((comment: any) => (
                                <div key={comment.id} className="flex gap-2">
                                    <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                                        {comment.user.image ? (
                                            <Image src={comment.user.image} alt={comment.user.name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">👤</div>
                                        )}
                                    </div>
                                    <div className="bg-white/5 p-2 rounded-lg flex-1">
                                        <p className="text-[10px] font-bold text-white mb-1">{comment.user.name}</p>
                                        <p className="text-xs text-gray-300">{comment.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
