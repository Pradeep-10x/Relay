'use client'

import React from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
  // Add your global context providers here (like ThemeProvider, QueryClientProvider, etc.)
  return <>{children}</>
}
