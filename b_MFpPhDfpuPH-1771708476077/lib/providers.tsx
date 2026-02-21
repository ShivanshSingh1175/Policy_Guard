"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppThemeProvider } from "./theme-context";
import { AuthProvider } from "./auth-context";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 30_000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </AppThemeProvider>
    </QueryClientProvider>
  );
}
