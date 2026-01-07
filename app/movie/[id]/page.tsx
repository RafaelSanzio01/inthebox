// src/app/movie/[id]/page.tsx
import { getMovieDetail } from "../../../lib/tmdb";
import Image from "next/image";
import Link from "next/link";
import WatchlistButton from "../../../components/WatchlistButton";
import WatchedButton from "../../../components/WatchedButton";
import BoxRating from "../../../components/BoxRating";
import { getMovieRating, getAverageRating, getReviews } from "@/app/actions";
import CreatePostForm from "../../../components/CreatePostForm";
import PostCard from "../../../components/PostCard";

/**
 * Movie Detail Page
 * Displays comprehensive information about a specific movie including cast, crew, and high-res visuals.
 */

interface PageProps {
  params: Promise<{ id: string }>; // Next.js 15: params is now a Promise
}

export default async function MovieDetailPage({ params }: PageProps) {
  // Await params before using the ID
  const { id } = await params;

  // Fetch movie data (includes credits like cast and crew)
  const movie = await getMovieDetail(id);

  if (!movie) {
    // Fallback: Check if it's a TV show (in case of wrong link or DB data)
    const { getTVDetail } = await import("../../../lib/tmdb");
    const { redirect } = await import("next/navigation");

    const tvShow = await getTVDetail(id);
    if (tvShow) {
      redirect(`/tv/${id}`);
    }

    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-gray-900">
        <h1 className="text-2xl">Movie not found</h1>
      </div>
    );
  }

  // Business Logic: Extract director and limit cast to top 5
  // Business Logic: Extract director and limit cast to top 5
  // Note: director is now an object { id, name } for linking, not just string
  const director = movie.credits?.crew.find((person: any) => person.job === 'Director');
  const topCast = movie.credits?.cast.slice(0, 5);
  // Extract official trailer (Youtube)
  const trailer = movie.videos?.results?.find((v: any) => v.type === "Trailer" && v.site === "YouTube");

  // Fetch rating data
  const userRating = await getMovieRating(movie.id);
  const { average, count } = await getAverageRating(movie.id);

  // Fetch reviews for this movie
  const moviePosts = await getReviews(movie.id);

  return (
    <div className="relative min-h-screen w-full bg-gray-900 text-white overflow-hidden pb-12">

      {/* 
          BACKGROUND LAYER 
          Cinematic backdrop with a blur effect and gradient overlay 
          to ensure text remains readable.
      */}
      <div className="absolute top-0 left-0 w-full h-[600px] md:h-[850px] pointer-events-none overflow-hidden">
        <Image
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path}`}
          alt="Cinema Backdrop"
          fill
          className="object-cover blur-[1.5px] opacity-60 scale-105"
        />
        {/* Cinematic Overlays for perfect blending */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-gray-900 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
      </div>

      {/* FOREGROUND CONTENT */}
      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col md:flex-row gap-10 items-start">

          {/* Main Poster Image & Actions Sidebar */}
          <div className="flex-shrink-0 flex flex-col gap-4 w-full md:w-[350px]">

            {/* Poster */}
            <div className="relative w-full aspect-[2/3] shadow-2xl rounded-xl overflow-hidden border border-white/10">
              <Image
                src={`https://image.tmdb.org/t/p/w780${movie.poster_path}`}
                alt={movie.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 w-full">
              <WatchedButton
                movieId={movie.id}
                title={movie.title}
                posterPath={movie.poster_path}
              />
              <WatchlistButton
                movieId={movie.id}
                title={movie.title}
                posterPath={movie.poster_path}
              />
              {trailer && (
                <a
                  href={`https://www.youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#FF0000] hover:bg-[#cc0000] text-white font-bold py-2 rounded-lg transition-all shadow-md group"
                >
                  {/* YouTube Logo SVG */}
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  <span className="text-sm uppercase tracking-wide">Trailer</span>
                </a>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-8 mt-4 md:mt-0">
            {/* Title, Genres, and Basic Stats */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres?.map((g: any) => (
                  <span key={g.id} className="text-xs font-bold bg-yellow-500 text-black px-2 py-1 rounded">
                    {g.name}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-2xl">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mt-4 text-gray-200 font-medium">
                <span className="bg-white/10 px-3 py-1 rounded-md backdrop-blur-md border border-white/10">
                  {movie.release_date?.split("-")[0] || "N/A"}
                </span>
                <div className="flex items-center gap-3">
                  {/* IMDb Badge */}
                  <div className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded border border-yellow-500/20">
                    <span className="text-[#f5c518] font-black tracking-tighter text-[10px] uppercase">IMDb</span>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <span className="text-sm">★</span>
                      <span className="font-bold text-white text-sm">{movie.vote_average.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Box Rate Badge */}
                  <div className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded border border-white/10">
                    <span className="bg-yellow-500 text-black px-1 rounded text-[10px] font-black tracking-tighter uppercase">BOX</span>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <span className="text-sm">★</span>
                      <span className="font-bold text-white text-sm">{average > 0 ? average.toFixed(1) : "N/A"}</span>
                    </div>
                  </div>
                </div>
                {movie.runtime && (
                  <span className="text-gray-400">{movie.runtime} min</span>
                )}
              </div>
            </div>

            {/* Top Cast List */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">The Cast</h3>
              <div className="flex flex-wrap gap-4">
                {topCast?.map((actor: any) => (
                  <Link key={actor.id} href={`/person/${actor.id}`}>
                    <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10 hover:border-yellow-500 transition-colors cursor-pointer">
                      {actor.profile_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                          alt={actor.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div className="text-xs">
                        <p className="font-bold text-white group-hover:text-yellow-500 transition-colors">{actor.name}</p>
                        <p className="text-gray-400">{actor.character}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Crew Details */}
            {director && (
              <div>
                <h3 className="text-lg font-semibold text-white">Director</h3>
                <Link href={`/person/${director.id}`} className="text-yellow-500 font-medium hover:underline">
                  {director.name}
                </Link>
              </div>
            )}

            {/* Production Companies */}
            {movie.production_companies && movie.production_companies.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Production</h3>
                <div className="flex flex-wrap gap-3 items-center">
                  {movie.production_companies.filter((c: any) => c.logo_path).slice(0, 4).map((company: any) => (
                    <div key={company.id} className="bg-white/10 p-2 rounded-md h-8 flex items-center justify-center hover:bg-white/20 transition-colors" title={company.name}>
                      <img
                        src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
                        alt={company.name}
                        className="h-full w-auto object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overview / Plot Summary */}
            <div>
              <h3 className="text-2xl font-semibold text-white mb-3">Overview</h3>
              <p className="text-gray-200 text-lg leading-relaxed max-w-3xl opacity-90">
                {movie.overview}
              </p>
            </div>

            {/* Box Rating Section */}
            <div className="max-w-xl">
              <BoxRating
                movieId={movie.id}
                initialRating={userRating}
                averageRating={average}
                ratingCount={count}
              />
            </div>


          </div>
        </div>

        {/* LOUNGE SECTION (Reddit Style Posts) */}
        <div className="mt-20 border-t border-white/5 pt-16">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-4xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
                  <span className="text-yellow-500">🛋️</span> Box Lounge
                </h2>
                <p className="text-gray-400 mt-2">People are talking about <span className="text-white font-bold">{movie.title}</span>.</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                <span className="text-yellow-500 underline underline-offset-8">Conversations</span>
                <span className="opacity-50 hover:opacity-100 cursor-pointer transition-opacity">Media</span>
              </div>
            </div>

            {/* Create Post Form */}
            <div className="mb-12">
              <CreatePostForm
                movieId={movie.id}
                movieTitle={movie.title}
                moviePoster={movie.poster_path}
              />
            </div>

            {/* Posts List */}
            <div className="space-y-8">
              {moviePosts.length === 0 ? (
                <div className="text-center py-16 bg-white/5 rounded-3xl border border-dashed border-white/10">
                  <p className="text-gray-400">No one has shared their thoughts yet. Be the first!</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {moviePosts.map((post: any) => (
                    <PostCard key={post.id} post={post} showMovieInfo={false} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
