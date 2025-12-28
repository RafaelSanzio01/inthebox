
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Action: Add a movie to the user's watchlist
export async function addToWatchlist(movieId: number, title: string, posterPath: string) {
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
      },
    });

    // 4. Revalidate the page to update the UI immediately
    revalidatePath(`/movie/${movieId}`);
    revalidatePath("/watchlist");
    return { success: true, message: "Movie added to watchlist!" };

  } catch (error) {
    console.error("Failed to add to watchlist:", error);
    return { success: false, message: "Movie is already in your watchlist or an error occurred." };
  }
}

export async function removeFromWatchlist(movieId: number) {
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
        userId_movieId: {
          userId: user.id,
          movieId: movieId,
        },
      },
    });

    revalidatePath(`/movie/${movieId}`);
    revalidatePath("/watchlist");
    return { success: true, message: "Movie removed from watchlist!" };
  } catch (error) {
    console.error("Failed to remove from watchlist:", error);
    return { success: false, message: "Failed to remove movie from watchlist." };
  }
}

export async function checkIsInWatchlist(movieId: number) {
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
      userId_movieId: {
        userId: user.id,
        movieId: movieId,
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

export async function toggleUpvote(reviewId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  // In a real app, we'd have a separate Upvote table to track per user.
  // For now, we'll just increment/decrement the upvote count for simplicity.
  // Ideally, this should prevent multiple votes from same user.

  await prisma.review.update({
    where: { id: reviewId },
    data: { upvotes: { increment: 1 } }
  });

  revalidatePath("/lounge");
}

export async function addComment(reviewId: string, content: string) {
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
      userId: user.id
    }
  });

  revalidatePath("/lounge");
}

// --- WATCHED ACTIONS ---

/**
 * Action: Mark a movie as watched or unmark it.
 */
export async function toggleWatched(movieId: number, title: string, posterPath: string) {
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
        userId_movieId: {
          userId: user.id,
          movieId: movieId,
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
      return { success: true, message: "Removed from watched list.", marked: false };
    } else {
      // Mark as watched
      await prisma.watchedItem.create({
        data: {
          userId: user.id,
          movieId: movieId,
          movieTitle: title,
          posterPath: posterPath,
        },
      });
      revalidatePath("/profile");
      revalidatePath("/");
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

