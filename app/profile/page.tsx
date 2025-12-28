import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import RemoveFromWatchedButton from "@/components/RemoveFromWatchedButton";
import { getAllAverageRatings } from "@/app/actions";

/**
 * Profile Page
 * Displays the user's information and their "Watched" history.
 */

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        redirect("/api/auth/signin");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            watched: {
                orderBy: { watchedAt: "desc" }
            }
        }
    });

    if (!user) return <div>User not found</div>;

    const watchedIds = user.watched.map(i => i.movieId);
    const communityRatings = await getAllAverageRatings(watchedIds);

    return (
        <div className="min-h-screen py-12 px-4 md:px-8 max-w-7xl mx-auto">
            {/* --- USER HEADER --- */}
            <div className="flex flex-col md:flex-row items-center gap-8 mb-16 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-500 shadow-2xl shadow-yellow-500/20">
                    <Image
                        src={user.image || `https://ui-avatars.com/api/?name=${user.name || 'User'}&background=eab308&color=000`}
                        alt={user.name || "User"}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-black text-white mb-2">{user.name}</h1>
                    <p className="text-gray-400 font-medium mb-4">{user.email}</p>
                    <div className="flex gap-4 justify-center md:justify-start">
                        <div className="bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-xl border border-yellow-500/20">
                            <span className="font-bold">{user.watched.length}</span> Watched
                        </div>
                    </div>
                </div>
            </div>

            {/* --- WATCHED HISTORY --- */}
            <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="text-yellow-500">👁</span> Watched History
                    </h2>
                </div>

                {user.watched.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/20">
                        <p className="text-gray-400 text-xl">You haven't marked anything as watched yet.</p>
                        <Link href="/" className="text-yellow-500 hover:text-yellow-400 font-bold mt-4 inline-block">
                            Start Exploring →
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {user.watched.map((item) => (
                            <div key={item.id} className="group relative">
                                <RemoveFromWatchedButton
                                    movieId={item.movieId}
                                    title={item.movieTitle || ""}
                                    posterPath={item.posterPath || ""}
                                />
                                <Link href={`/movie/${item.movieId}`}>
                                    <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 group-hover:border-yellow-500/50 transition-all duration-300 transform group-hover:scale-[1.02]">
                                        {item.posterPath ? (
                                            <Image
                                                src={`https://image.tmdb.org/t/p/w342${item.posterPath}`}
                                                alt={item.movieTitle || "Movie"}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                                                No Image
                                            </div>
                                        )}

                                        {/* Box Rate Badge */}
                                        {communityRatings[item.movieId] && communityRatings[item.movieId].count > 0 && (
                                            <div className="absolute top-2 left-2 z-20">
                                                <div className="bg-black/80 backdrop-blur-md border border-yellow-500/30 px-2 py-1 rounded-lg">
                                                    <span className="text-yellow-500 text-[10px] font-black tracking-tighter">
                                                        BOX {communityRatings[item.movieId].average.toFixed(1)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                                        {/* Date Badge */}
                                        <div className="absolute bottom-2 left-2 right-2 text-[10px] bg-black/80 backdrop-blur-md text-gray-300 py-1 px-2 rounded-lg text-center border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Watched: {new Date(item.watchedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <h3 className="text-white text-sm font-bold mt-3 truncate group-hover:text-yellow-500 transition-colors">
                                        {item.movieTitle}
                                    </h3>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
}
