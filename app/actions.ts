
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getGenres, getDiscoveryMovies, Movie } from "@/lib/tmdb";

// Action: Add a movie to the user's watchlist
export async function addToWatchlist(movieId: number, title: string, posterPath: string, mediaType: string = "movie") {
  // 1. Get the current user session
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    throw new Error("You must be logged in to add movies to your watchlist.");
  }

  // 2. Find the user in the database to get their ID
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  // 3. Add to database (Prisma)
  try {
    await prisma.watchlistItem.create({
      data: {
        userId: user.id,
        movieId: movieId,
        movieTitle: title,
        posterPath: posterPath,
        mediaType: mediaType,
      },
    });

    // 4. Revalidate the page to update the UI immediately
    revalidatePath(`/movie/${movieId}`);
    revalidatePath(`/tv/${movieId}`);
    revalidatePath("/watchlist");
    return { success: true, message: "Movie added to watchlist!" };

  } catch (error) {
    console.error("Failed to add to watchlist:", error);
    return { success: false, message: "Movie is already in your watchlist or an error occurred." };
  }
}

export async function removeFromWatchlist(movieId: number, mediaType: string = "movie") {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    throw new Error("You must be logged in to remove movies from your watchlist.");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  try {
    await prisma.watchlistItem.delete({
      where: {
        userId_movieId_mediaType: {
          userId: user.id,
          movieId: movieId,
          mediaType: mediaType,
        },
      },
    });

    revalidatePath(`/movie/${movieId}`);
    revalidatePath(`/tv/${movieId}`);
    revalidatePath("/watchlist");
    return { success: true, message: "Movie removed from watchlist!" };
  } catch (error) {
    console.error("Failed to remove from watchlist:", error);
    return { success: false, message: "Failed to remove movie from watchlist." };
  }
}

export async function checkIsInWatchlist(movieId: number, mediaType: string = "movie") {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return false;
  }

  const item = await prisma.watchlistItem.findUnique({
    where: {
      userId_movieId_mediaType: {
        userId: user.id,
        movieId: movieId,
        mediaType: mediaType,
      },
    },
  });

  return !!item;
}

export async function getWatchlistIds() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.email) {
    return [];
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      watchlist: {
        select: { movieId: true }
      }
    }
  });

  return user?.watchlist.map(item => item.movieId) || [];
}

export async function toggleVote({
  reviewId,
  commentId,
  type
}: {
  reviewId?: string;
  commentId?: string;
  type: number; // 1 for up, -1 for down
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) throw new Error("User not found");

  const voteWhere = reviewId
    ? { userId_reviewId: { userId: user.id, reviewId } }
    : { userId_commentId: { userId: user.id, commentId: commentId! } };

  const existingVote = await prisma.vote.findUnique({
    where: voteWhere as any
  });

  if (existingVote) {
    if (existingVote.type === type) {
      // Remove vote if clicking the same button
      await prisma.vote.delete({ where: { id: existingVote.id } });
    } else {
      // Change vote type
      await prisma.vote.update({
        where: { id: existingVote.id },
        data: { type }
      });
    }
  } else {
    // Create new vote
    await prisma.vote.create({
      data: {
        type,
        userId: user.id,
        reviewId,
        commentId,
      }
    });
  }

  // Re-calculate counts (Simple approach: count and update Review/Comment if they have fields, 
  // or just count in getReviews. Let's keep fields updated for perf.)
  if (reviewId) {
    const upvotes = await prisma.vote.count({ where: { reviewId, type: 1 } });
    const downvotes = await prisma.vote.count({ where: { reviewId, type: -1 } });
    await prisma.review.update({
      where: { id: reviewId },
      data: { upvotes, downvotes }
    });
  }

  revalidatePath("/lounge");
  revalidatePath("/profile");
}

export async function addComment(reviewId: string, content: string, parentId?: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) throw new Error("User not found");

  await prisma.comment.create({
    data: {
      content,
      reviewId,
      userId: user.id,
      parentId
    }
  });

  revalidatePath("/lounge");
}

export async function createReview({
  movieId,
  title,
  content,
  movieTitle,
  moviePoster,
  rating
}: {
  movieId: number;
  title: string;
  content: string;
  movieTitle: string;
  moviePoster: string;
  rating: number;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) throw new Error("User not found");

  try {
    const review = await prisma.review.create({
      data: {
        movieId,
        title,
        content,
        movieTitle,
        moviePoster,
        rating,
        userId: user.id,
      }
    });

    revalidatePath("/lounge");
    revalidatePath(`/movie/${movieId}`);
    revalidatePath(`/tv/${movieId}`);
    revalidatePath("/profile");

    return { success: true, review };
  } catch (error) {
    console.error("Failed to create review:", error);
    return { success: false, message: "Failed to create review." };
  }
}

export async function getReviews(movieId?: number, sort: 'new' | 'top' | 'hot' = 'new') {
  const session = await getServerSession(authOptions);
  let userId: string | undefined;

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    userId = user?.id;
  }

  let orderBy: any = { createdAt: 'desc' };

  if (sort === 'top') {
    orderBy = { upvotes: 'desc' };
  } else if (sort === 'hot') {
    // Simple "Hot" algo: Recent popular posts (e.g. sorted by vote count, but maybe we can just stick to upvotes for now or a mix)
    // For now, let's map Hot to a mix or just upvotes? 
    // Let's make Hot = Upvotes for simplicity, or we can assume Hot is the default 'Trending' which might need more complex query.
    // Let's make Hot = popularity (votes) for now, similar to Top, but maybe we can add a timeframe later.
    // Actually, usually Hot = (Score) / (Time+1)^G aka Hacker News algo. 
    // Since we are using Prisma basic generic sort, let's just make Hot = Top (upvotes) and New = Recent.
    // Or better, let's keep New = createdAt. Top = upvotes. Hot = maybe comments count? 
    // Let's just make Top = upvotes and New = createdAt. Hot... let's separate it.
    // For this context, let's treating Top as Upvotes.
    orderBy = { upvotes: 'desc' };
  }

  return await prisma.review.findMany({
    where: movieId ? { movieId } : {},
    include: {
      user: true,
      votes: userId ? { where: { userId } } : false,
      comments: {
        include: {
          user: true,
          votes: userId ? { where: { userId } } : false,
          replies: {
            include: {
              user: true,
              votes: userId ? { where: { userId } } : false,
              replies: {
                include: {
                  user: true,
                  votes: userId ? { where: { userId } } : false,
                }
              }
            }
          }
        },
        where: { parentId: null }, // Only top-level comments first
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: orderBy
  });
}

export async function getUserReviews(userId: string) {
  return await prisma.review.findMany({
    where: { userId },
    include: {
      user: true,
      comments: {
        include: {
          user: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

// --- WATCHED ACTIONS ---

// Action: Add a movie to the user's watched list
export async function addToWatched(movieId: number, title: string, posterPath: string, mediaType: string = "movie") {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("You must be logged in.");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) throw new Error("User not found.");

  try {
    await prisma.watchedItem.upsert({
      where: {
        userId_movieId_mediaType: {
          userId: user.id,
          movieId: movieId,
          mediaType: mediaType,
        },
      },
      update: {},
      create: {
        userId: user.id,
        movieId: movieId,
        movieTitle: title,
        posterPath: posterPath,
        mediaType: mediaType,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/");
    revalidatePath(`/movie/${movieId}`);
    revalidatePath(`/tv/${movieId}`);
    return { success: true, message: "Marked as watched!" };
  } catch (error) {
    console.error("Failed to add to watched:", error);
    return { success: false, message: "Failed to mark as watched." };
  }
}

// Action: Remove a movie from the user's watched list
export async function removeFromWatched(movieId: number, mediaType: string = "movie") {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("You must be logged in.");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) throw new Error("User not found.");

  try {
    await prisma.watchedItem.delete({
      where: {
        userId_movieId_mediaType: {
          userId: user.id,
          movieId: movieId,
          mediaType: mediaType,
        },
      },
    });

    revalidatePath("/profile");
    revalidatePath("/");
    revalidatePath(`/movie/${movieId}`);
    revalidatePath(`/tv/${movieId}`);
    return { success: true, message: "Removed from watched list." };
  } catch (error) {
    console.error("Failed to remove from watched:", error);
    return { success: false, message: "Failed to remove from watched list." };
  }
}

/**
 * Action: Mark a movie as watched or unmark it.
 */
export async function toggleWatched(movieId: number, title: string, posterPath: string, mediaType: string = "movie") {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, message: "You must be logged in." };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) return { success: false, message: "User not found." };

  try {
    const existing = await prisma.watchedItem.findUnique({
      where: {
        userId_movieId_mediaType: {
          userId: user.id,
          movieId: movieId,
          mediaType: mediaType,
        },
      },
    });

    if (existing) {
      // Remove if already marked as watched
      await prisma.watchedItem.delete({
        where: { id: existing.id }
      });
      revalidatePath("/profile");
      revalidatePath("/");
      revalidatePath(`/movie/${movieId}`);
      revalidatePath(`/tv/${movieId}`);
      return { success: true, message: "Removed from watched list.", marked: false };
    } else {
      // Mark as watched
      await prisma.watchedItem.create({
        data: {
          userId: user.id,
          movieId: movieId,
          movieTitle: title,
          posterPath: posterPath,
          mediaType: mediaType,
        },
      });
      revalidatePath("/profile");
      revalidatePath("/");
      revalidatePath(`/movie/${movieId}`);
      revalidatePath(`/tv/${movieId}`);
      return { success: true, message: "Marked as watched!", marked: true };
    }
  } catch (error) {
    console.error("Watched toggle failed:", error);
    return { success: false, message: "Something went wrong." };
  }
}

/**
 * Fetch IDs of all movies the user has watched.
 */
export async function getWatchedIds() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return [];

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      watched: {
        select: { movieId: true }
      }
    }
  });

  return user?.watched.map(item => item.movieId) || [];
}

// --- RATING ACTIONS ---

export async function rateMovie(movieId: number, value: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });
  if (!user) throw new Error("User not found");

  await prisma.rating.upsert({
    where: {
      userId_movieId: {
        userId: user.id,
        movieId: movieId,
      },
    },
    update: { value },
    create: {
      userId: user.id,
      movieId: movieId,
      value: value,
    },
  });

  revalidatePath(`/movie/${movieId}`);
  revalidatePath(`/tv/${movieId}`);
  revalidatePath("/");
  revalidatePath("/popular");
  revalidatePath("/series");
  revalidatePath("/watchlist");
  revalidatePath("/profile");
}

export async function getMovieRating(movieId: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });
  if (!user) return null;

  const rating = await prisma.rating.findUnique({
    where: {
      userId_movieId: {
        userId: user.id,
        movieId: movieId,
      },
    },
  });

  return rating?.value || null;
}

export async function getAverageRating(movieId: number) {
  const aggregate = await prisma.rating.aggregate({
    where: { movieId },
    _avg: { value: true },
    _count: { value: true },
  });

  return {
    average: aggregate._avg.value || 0,
    count: aggregate._count.value || 0,
  };
}

export async function getAllAverageRatings(movieIds: number[]) {
  const ratings = await prisma.rating.groupBy({
    by: ['movieId'],
    where: {
      movieId: { in: movieIds }
    },
    _avg: {
      value: true
    },
    _count: {
      value: true
    }
  });

  const ratingMap: Record<number, { average: number; count: number }> = {};
  ratings.forEach(r => {
    ratingMap[r.movieId] = {
      average: r._avg.value || 0,
      count: r._count.value || 0
    };
  });

  return ratingMap;
}


// --- DISCOVERY ACTIONS ---

export async function getGenresList() {
  return await getGenres();
}

export async function fetchSurpriseMovie(genreIds: number[]): Promise<Movie | null> {
  // Random page between 1 and 10 to ensure variety
  const randomPage = Math.floor(Math.random() * 10) + 1;
  const movies = await getDiscoveryMovies(genreIds, randomPage);

  if (!movies || movies.length === 0) {
    // Fallback to page 1 if deep page has no results
    const fallbackMovies = await getDiscoveryMovies(genreIds, 1);
    if (!fallbackMovies || fallbackMovies.length === 0) return null;
    return fallbackMovies[Math.floor(Math.random() * fallbackMovies.length)];
  }

  const randomMovie = movies[Math.floor(Math.random() * movies.length)];
  return randomMovie;
}
