// src/app/actions.ts
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
    return { success: true, message: "Movie added to watchlist!" };

  } catch (error) {
    // Handle duplicate entry (Prisma error code P2002)
    // In a real app, you might check error.code === 'P2002'
    console.error("Failed to add to watchlist:", error);
    return { success: false, message: "Movie is already in your watchlist or an error occurred." };
  }
}