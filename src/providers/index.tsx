'use client'

import { ReactNode } from 'react'
import { GlobalProvider } from './global-context'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <GlobalProvider>
      {children}
    </GlobalProvider>
  )
}