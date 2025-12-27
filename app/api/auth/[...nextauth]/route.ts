// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

// IMPORT: Adjust this path if your 'lib' folder is somewhere else
// Try '@/lib/prisma' first. If it fails, try relative path like '../../../../../lib/prisma'
import { prisma } from "@/lib/prisma"; 

export const authOptions: AuthOptions = {
  // Database Adapter: Connects NextAuth to our SQLite database via Prisma
  adapter: PrismaAdapter(prisma),
  
  // Authentication Providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  
  // Debugging configuration
  debug: process.env.NODE_ENV === "development",
  
  // Encryption secret
  secret: process.env.NEXTAUTH_SECRET,
  
  // Session strategy
  session: {
    strategy: "database", 
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };