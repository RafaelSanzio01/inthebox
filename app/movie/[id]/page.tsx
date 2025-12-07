import { getMovieDetail } from '../../../lib/tmdb'; // Dosya yoluna dikkat (lib nerede?)
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Next.js 15 Değişikliği: Params artık bir Promise.
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MovieDetailPage({ params }: PageProps) {
  // ÖNCE PARAMS'I ÇÖZÜMLÜYORUZ (AWAIT)
  const { id } = await params;
  
  // Sonra veriyi çekiyoruz
  const movie = await getMovieDetail(id);

  if (!movie) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Arka Plan Resmi */}
      <div className="relative h-[60vh] w-full">
        <div className="absolute inset-0">
          {movie.backdrop_path && (
            <Image
              src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
              alt={movie.title}
              fill
              className="object-cover opacity-30"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        <div className="relative container mx-auto px-4 h-full flex items-end pb-10">
          <div className="flex flex-col md:flex-row gap-8 items-end">
            <div className="relative w-48 h-72 md:w-64 md:h-96 flex-shrink-0 rounded-lg overflow-hidden shadow-2xl border-2 border-gray-800">
              {movie.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="bg-gray-800 w-full h-full flex items-center justify-center">No Image</div>
              )}
            </div>
            <div className="mb-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-2">{movie.title}</h1>
              <div className="flex items-center space-x-4 text-sm md:text-base text-gray-300 mb-4">
                <span className="bg-yellow-500 text-black px-2 py-1 rounded font-bold">
                  IMDB: {movie.vote_average.toFixed(1)}
                </span>
                <span>{movie.release_date}</span>
              </div>
              {movie.tagline && (
                <p className="text-xl text-gray-400 italic mb-4">
                  &quot;{movie.tagline}&quot;
                </p>
              )}
              <div className="max-w-2xl">
                <h3 className="text-lg font-semibold mb-1 text-white">Overview</h3>
                <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <Link href="/" className="inline-block bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}