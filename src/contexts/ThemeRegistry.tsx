'use client'

import createEmotionCache from '@/lib/emotion-cache'
import { CacheProvider } from '@emotion/react'
import { ReactNode } from 'react'

const clientSideEmotionCache = createEmotionCache()

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  return <CacheProvider value={clientSideEmotionCache}>{children}</CacheProvider>
}
