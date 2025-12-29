import { getReviews } from "@/app/actions";
import PostCard from "@/components/PostCard";
import Logo from "@/components/Logo";

export default async function LoungePage() {
    const posts = await getReviews();

    return (
        <div className="min-h-screen py-12 px-4 md:px-8 max-w-4xl mx-auto space-y-12">
            {/* Search & Welcome Header */}
            <div className="text-center space-y-4">
                <div className="inline-block p-4 rounded-3xl bg-yellow-500/10 border border-yellow-500/20 mb-4">
                    <Logo showText={false} />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase">
                    Movie <span className="text-yellow-500">Lounge</span>
                </h1>
                <p className="text-gray-400 max-w-xl mx-auto text-lg">
                    Dive into conversations about the latest stories. Upvote, comment, and unbox great stories with the community.
                </p>
            </div>

            {/* Feed */}
            <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-yellow-500">🔥</span> Global Feed
                    </h2>
                    <div className="flex gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                        <button className="text-yellow-500">Hot</button>
                        <button className="hover:text-white transition-colors">New</button>
                        <button className="hover:text-white transition-colors">Top</button>
                    </div>
                </div>

                {posts.length === 0 ? (
                    <div className="text-center py-20 bg-gray-900/30 rounded-3xl border border-dashed border-gray-800">
                        <p className="text-gray-400">The lounge is quiet... for now. Be the first to start a conversation!</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {posts.map((post: any) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
