
import { getPersonDetail, getPersonCredits } from "../../../lib/tmdb";
import Image from "next/image";
import Link from "next/link";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function PersonDetailPage({ params }: PageProps) {
    const { id } = await params;
    const person = await getPersonDetail(id);
    const credits = await getPersonCredits(id);

    if (!person) {
        return (
            <div className="flex items-center justify-center min-h-screen text-white bg-gray-900">
                <h1 className="text-2xl">Person not found</h1>
            </div>
        );
    }

    // Known For (mix of Cast and Crew)
    // Determine if asking for cast or crew primarily based on department
    const isActor = person.known_for_department === "Acting";
    const creditList = isActor ? credits.cast : credits.crew;

    // Sort by vote_count to show most known movies first
    creditList.sort((a: any, b: any) => (b.vote_count || 0) - (a.vote_count || 0));

    // Deduplicate credits by ID (sometimes API returns duplicates for different roles)
    const uniqueCredits = creditList.filter((v: any, i: number, a: any[]) => a.findIndex((t: any) => t.id === v.id) === i);
    // Limit to 50 items for performance/cleanliness
    const knownFor = uniqueCredits.slice(0, 50);

    return (
        <div className="min-h-screen bg-gray-900 text-white py-12 px-4 md:px-8">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row gap-12">

                    {/* LEFT: Profile Image & Personal Info */}
                    <div className="w-full md:w-[300px] flex-shrink-0 space-y-6">
                        <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                            {person.profile_path ? (
                                <Image
                                    src={`https://image.tmdb.org/t/p/h632${person.profile_path}`}
                                    alt={person.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-400">
                                    No Image
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white border-b border-white/10 pb-2">Personal Info</h3>

                            <div className="space-y-1">
                                <p className="font-bold text-white">Known For</p>
                                <p className="text-gray-400 text-sm">{person.known_for_department}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="font-bold text-white">Gender</p>
                                <p className="text-gray-400 text-sm">
                                    {person.gender === 1 ? "Female" : person.gender === 2 ? "Male" : "Non-binary"}
                                </p>
                            </div>

                            {person.birthday && (
                                <div className="space-y-1">
                                    <p className="font-bold text-white">Birthday</p>
                                    <p className="text-gray-400 text-sm">
                                        {person.birthday}
                                        {person.deathday ? ` (Died: ${person.deathday})` : ` (${new Date().getFullYear() - new Date(person.birthday).getFullYear()} years old)`}
                                    </p>
                                </div>
                            )}

                            {person.place_of_birth && (
                                <div className="space-y-1">
                                    <p className="font-bold text-white">Place of Birth</p>
                                    <p className="text-gray-400 text-sm">{person.place_of_birth}</p>
                                </div>
                            )}

                            {/* External Links & Socials */}
                            <div className="pt-4 border-t border-white/10 space-y-3">
                                <p className="font-bold text-white">Connect</p>
                                <div className="flex flex-wrap gap-3">
                                    {person.external_ids?.imdb_id && (
                                        <a href={`https://www.imdb.com/name/${person.external_ids.imdb_id}`} target="_blank" rel="noopener noreferrer"
                                            className="bg-[#f5c518] text-black text-xs font-black px-2 py-1 rounded hover:opacity-80 transition-opacity">
                                            IMDb
                                        </a>
                                    )}
                                    {person.external_ids?.instagram_id && (
                                        <a href={`https://instagram.com/${person.external_ids.instagram_id}`} target="_blank" rel="noopener noreferrer"
                                            className="text-pink-500 hover:text-pink-400 transition-colors">
                                            IG
                                        </a>
                                    )}
                                    {person.external_ids?.twitter_id && (
                                        <a href={`https://twitter.com/${person.external_ids.twitter_id}`} target="_blank" rel="noopener noreferrer"
                                            className="text-blue-400 hover:text-blue-300 transition-colors">
                                            TW
                                        </a>
                                    )}
                                    {person.external_ids?.facebook_id && (
                                        <a href={`https://facebook.com/${person.external_ids.facebook_id}`} target="_blank" rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-500 transition-colors">
                                            FB
                                        </a>
                                    )}
                                    {person.homepage && (
                                        <a href={person.homepage} target="_blank" rel="noopener noreferrer"
                                            className="text-yellow-500 hover:text-yellow-400 transition-colors">
                                            🌐
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Also Known As */}
                            {person.also_known_as && person.also_known_as.length > 0 && (
                                <div className="pt-4 border-t border-white/10 space-y-1">
                                    <p className="font-bold text-white">Also Known As</p>
                                    <div className="flex flex-wrap gap-2">
                                        {person.also_known_as.slice(0, 3).map((alias: string, idx: number) => (
                                            <span key={idx} className="text-gray-400 text-xs border border-white/10 px-2 py-1 rounded-full">
                                                {alias}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* RIGHT: Biography & Filmography */}
                    <div className="flex-1 space-y-10">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-white mb-6">{person.name}</h1>
                            <h3 className="text-xl font-bold text-yellow-500 mb-2">Biography</h3>
                            <div className="text-gray-300 leading-relaxed space-y-4 text-justify">
                                {person.biography ? (
                                    person.biography.split('\n').map((paragraph: string, index: number) => (
                                        <p key={index}>{paragraph}</p>
                                    ))
                                ) : (
                                    <p>No biography available.</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="text-yellow-500">🎬</span> Known For
                            </h3>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {knownFor.map((item: any) => (
                                    <Link
                                        href={`/${item.media_type === 'tv' ? 'tv' : 'movie'}/${item.id}`}
                                        key={item.id}
                                        className="group"
                                    >
                                        <div className="bg-white/5 rounded-xl overflow-hidden border border-white/5 hover:border-yellow-500 transition-colors">
                                            <div className="relative aspect-[2/3]">
                                                {item.poster_path ? (
                                                    <Image
                                                        src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                                                        alt={item.title || item.name}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xs text-center p-2 text-gray-500">
                                                        No Poster
                                                    </div>
                                                )}
                                                {item.vote_average > 0 && (
                                                    <div className="absolute top-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-yellow-500 border border-yellow-500/20">
                                                        {item.vote_average.toFixed(1)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-sm font-bold text-white truncate group-hover:text-yellow-500 transition-colors flex-1 pr-2">
                                                        {item.title || item.name}
                                                    </p>
                                                    <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                                                        {(item.release_date || item.first_air_date)?.split('-')[0] || ""}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1 truncate">
                                                    {isActor ? (item.character || "Unknown Role") : (item.job || "Crew")}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
