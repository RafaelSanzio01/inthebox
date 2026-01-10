import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

// IMPORT: Adjust this path if your 'lib' folder is somewhere else
// Try '@/lib/prisma' first. If it fails, try relative path like '../../../../../lib/prisma'
import { prisma } from "@/lib/prisma";

export const authOptions: AuthOptions = {
  // Database Adapter: Connects NextAuth to our SQLite database via Prisma
  adapter: PrismaAdapter(prisma),

  // Authentication Providers
  providers: [
    CredentialsProvider({
      name: "Guest Login",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Guest Name" }
      },
      async authorize(credentials) {
        const name = credentials?.username || "Guest";
        // Create a fake email based on username to satisfy DB constraints
        const email = `${name.toLowerCase().replace(/\s/g, '')}@guest.box`;

        // Upsert user: Find if exists, otherwise create
        const user = await prisma.user.upsert({
          where: { email },
          update: {}, // If exists, do nothing
          create: {
            name: name,
            email: email,
            image: `https://ui-avatars.com/api/?name=${name}&background=random`
          }
        });
        return user;
      }
    }),
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
    strategy: "jwt",
  },

  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    }
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };