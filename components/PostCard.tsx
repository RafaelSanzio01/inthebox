"use client";

import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { toggleVote, addComment } from "@/app/actions";
import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface CommentItemProps {
    comment: any;
    postId: string;
    depth?: number;
}

function CommentItem({ comment, postId, depth = 0 }: CommentItemProps) {
    const { data: session } = useSession();
    const [isPending, startTransition] = useTransition();
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyContent, setReplyContent] = useState("");

    // Calculate votes from the 'votes' relation or field
    const userVote = comment.votes?.[0]?.type || 0;
    const [voteStatus, setVoteStatus] = useState(userVote);
    const [voteCount, setVoteCount] = useState((comment.upvotes || 0) - (comment.downvotes || 0));

    const handleVote = async (type: number) => {
        if (!session) {
            toast.error("Please login to vote");
            return;
        }
        startTransition(async () => {
            try {
                await toggleVote({ commentId: comment.id, type });
                // Optimistic UI update
                if (voteStatus === type) {
                    setVoteStatus(0);
                    setVoteCount(prev => prev - type);
                } else {
                    const diff = type - voteStatus;
                    setVoteStatus(type);
                    setVoteCount(prev => prev + diff);
                }
            } catch (error) {
                toast.error("Failed to vote");
            }
        });
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        startTransition(async () => {
            try {
                await addComment(postId, replyContent, comment.id);
                setReplyContent("");
                setShowReplyInput(false);
                toast.success("Reply added!");
            } catch (error) {
                toast.error("Failed to add reply");
            }
        });
    };

    if (depth > 5) return null; // Prevent extreme nesting

    return (
        <div className="relative group/comment">
            {/* Thread Line */}
            <div className="absolute left-[11px] top-8 bottom-0 w-[2px] bg-[#343536] group-hover/comment:bg-[#474748] transition-colors" />

            <div className="flex gap-2 relative">
                <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-800 flex-shrink-0 z-10">
                    {comment.user.image ? (
                        <Image src={comment.user.image} alt={comment.user.name} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] bg-red-500 text-white">👤</div>
                    )}
                </div>
                <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-[12px]">
                        <span className="font-bold text-[#D7DADC]">u/{comment.user.name?.replace(/\s+/g, '').toLowerCase()}</span>
                        <span className="text-[#818384]">• {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                    </div>
                    <div className="text-[#D7DADC] text-[14px] leading-relaxed">
                        {comment.content}
                    </div>
                    <div className="flex items-center gap-4 pt-1 text-[#818384] font-bold text-[12px]">
                        <div className="flex items-center gap-1 bg-black/20 rounded-full px-1">
                            <button
                                onClick={() => handleVote(1)}
                                className={`hover:text-[#D93A00] p-0.5 ${voteStatus === 1 ? 'text-[#D93A00]' : ''}`}
                            >▲</button>
                            <span className={voteStatus !== 0 ? (voteStatus === 1 ? 'text-[#D93A00]' : 'text-[#7193FF]') : ''}>
                                {voteCount}
                            </span>
                            <button
                                onClick={() => handleVote(-1)}
                                className={`hover:text-[#7193FF] transition-transform rotate-180 p-0.5 ${voteStatus === -1 ? 'text-[#7193FF]' : ''}`}
                            >▲</button>
                        </div>
                        <button
                            onClick={() => setShowReplyInput(!showReplyInput)}
                            className="hover:bg-[#D7DADC]/10 px-1 rounded transition-colors uppercase tracking-tight"
                        >
                            Reply
                        </button>
                    </div>

                    {showReplyInput && (
                        <form onSubmit={handleReply} className="mt-2 space-y-2 max-w-md">
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Write a reply..."
                                className="w-full bg-[#1A1A1B] border border-[#343536] rounded px-3 py-1.5 text-xs text-[#D7DADC] focus:outline-none focus:border-[#D7DADC]/30 min-h-[60px]"
                            />
                            <div className="flex gap-2">
                                <button type="submit" disabled={isPending} className="bg-[#D7DADC] text-black px-3 py-1 rounded-full text-[10px] font-bold hover:bg-[#EBEEF0]">
                                    Reply
                                </button>
                                <button type="button" onClick={() => setShowReplyInput(false)} className="text-[#818384] text-[10px] hover:underline">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Recursive Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 space-y-4">
                            {comment.replies.map((reply: any) => (
                                <CommentItem key={reply.id} comment={reply} postId={postId} depth={depth + 1} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

interface PostCardProps {
    post: any;
    showMovieInfo?: boolean;
}

export default function PostCard({ post, showMovieInfo = true }: PostCardProps) {
    const { data: session } = useSession();
    const userVote = post.votes?.[0]?.type || 0;
    const [voteStatus, setVoteStatus] = useState(userVote);
    const [voteCount, setVoteCount] = useState(post.upvotes - post.downvotes);
    const [isPending, startTransition] = useTransition();
    const [showComments, setShowComments] = useState(false);
    const [commentContent, setCommentContent] = useState("");

    const handleVote = async (type: number) => {
        if (!session) {
            toast.error("Please login to vote");
            return;
        }
        startTransition(async () => {
            try {
                await toggleVote({ reviewId: post.id, type });
                // Optimistic UI update
                if (voteStatus === type) {
                    setVoteStatus(0);
                    setVoteCount(prev => prev - type);
                } else {
                    const diff = type - voteStatus;
                    setVoteStatus(type);
                    setVoteCount(prev => prev + diff);
                }
            } catch (error) {
                toast.error("Failed to vote");
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
            } catch (error) {
                toast.error("Failed to add comment");
            }
        });
    };

    return (
        <div className="bg-[#1A1A1B] border border-[#343536] rounded-md overflow-hidden hover:border-[#474748] transition-colors group">
            <div className="flex">
                {/* 1. VOTE SIDEBAR (DESKTOP) */}
                <div className="hidden md:flex flex-col items-center w-10 bg-[#151516]/50 py-2 gap-1">
                    <button
                        onClick={() => handleVote(1)}
                        disabled={isPending}
                        className={`p-1 rounded hover:bg-[#D7DADC]/10 transition-all ${voteStatus === 1 ? 'text-[#D93A00]' : 'text-[#818384]'}`}
                    >
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 4.435L6.5 10h11L12 4.435z" /></svg>
                    </button>
                    <span className={`text-xs font-bold ${voteStatus !== 0 ? (voteStatus === 1 ? 'text-[#D93A00]' : 'text-[#7193FF]') : 'text-[#D7DADC]'}`}>
                        {voteCount}
                    </span>
                    <button
                        onClick={() => handleVote(-1)}
                        disabled={isPending}
                        className={`p-1 rounded hover:bg-[#D7DADC]/10 transition-all ${voteStatus === -1 ? 'text-[#7193FF]' : 'text-[#818384]'}`}
                    >
                        <svg className="w-6 h-6 fill-current rotate-180" viewBox="0 0 24 24"><path d="M12 4.435L6.5 10h11L12 4.435z" /></svg>
                    </button>
                </div>

                {/* 2. MAIN CONTENT AREA */}
                <div className="flex-1 p-3 space-y-2">
                    <div className="flex items-center gap-2 text-[12px]">
                        {showMovieInfo && post.movieId ? (
                            <Link href={`/movie/${post.movieId}`} className="flex items-center gap-1.5 group/link">
                                <div className="relative w-5 h-7 bg-gray-800 rounded-sm overflow-hidden border border-white/5">
                                    {post.moviePoster ? (
                                        <Image
                                            src={post.moviePoster.startsWith('http') ? post.moviePoster : `https://image.tmdb.org/t/p/w185${post.moviePoster.startsWith('/') ? '' : '/'}${post.moviePoster}`}
                                            alt={post.movieTitle}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[8px]">🎬</div>
                                    )}
                                </div>
                                <span className="font-bold text-[#D7DADC] hover:underline">b/{post.movieTitle?.replace(/\s+/g, '').toLowerCase()}</span>
                            </Link>
                        ) : (
                            <span className="font-bold text-[#D7DADC]">Box Lounge</span>
                        )}
                        <span className="text-[#818384]">•</span>
                        <span className="text-[#818384]">Posted by u/{post.user.name?.replace(/\s+/g, '').toLowerCase()}</span>
                        <span className="text-[#818384]">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-lg md:text-[20px] font-medium text-[#D7DADC] leading-tight">
                            {post.title}
                        </h3>
                        <p className="text-[#D7DADC] text-sm md:text-md leading-relaxed whitespace-pre-wrap font-light opacity-90">
                            {post.content}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        {/* Vote (Mobile Only) */}
                        <div className="flex md:hidden items-center bg-[#272729] rounded-full px-1">
                            <button onClick={() => handleVote(1)} className={`p-2 ${voteStatus === 1 ? 'text-[#D93A00]' : 'text-[#818384]'}`}><span className="text-lg">▲</span></button>
                            <span className={`text-xs font-bold px-1 ${voteStatus !== 0 ? (voteStatus === 1 ? 'text-[#D93A00]' : 'text-[#7193FF]') : 'text-[#D7DADC]'}`}>{voteCount}</span>
                            <button onClick={() => handleVote(-1)} className={`p-2 ${voteStatus === -1 ? 'text-[#7193FF]' : 'text-[#818384]'}`}><span className="text-lg rotate-180 inline-block">▲</span></button>
                        </div>

                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-sm hover:bg-[#D7DADC]/10 text-[#818384] font-bold text-[12px] transition-colors"
                        >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2z" /></svg>
                            {post.comments.length} Comments
                        </button>
                    </div>

                    {showComments && (
                        <div className="mt-4 space-y-6 pt-4 border-t border-[#343536]">
                            <form onSubmit={handleAddComment} className="flex flex-col gap-2">
                                <textarea
                                    placeholder="What are your thoughts?"
                                    value={commentContent}
                                    onChange={(e) => setCommentContent(e.target.value)}
                                    className="w-full bg-[#1A1A1B] border border-[#343536] rounded-md p-3 text-sm text-[#D7DADC] focus:outline-none focus:border-[#D7DADC]/30 min-h-[100px]"
                                />
                                <div className="flex justify-end bg-[#272729] p-2 rounded-b-md border-x border-b border-[#343536] -mt-2">
                                    <button
                                        type="submit"
                                        disabled={isPending}
                                        className="bg-[#D7DADC] text-black px-4 py-1.5 rounded-full text-xs font-bold hover:bg-[#EBEEF0] transition-colors disabled:opacity-50"
                                    >
                                        Comment
                                    </button>
                                </div>
                            </form>

                            <div className="space-y-6 pl-1">
                                {post.comments.map((comment: any) => (
                                    <CommentItem key={comment.id} comment={comment} postId={post.id} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
