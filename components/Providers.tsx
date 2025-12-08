// components/Providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";

// Wrapper component to provide Authentication context to the app
// This allows useSession() to work anywhere in the application
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}