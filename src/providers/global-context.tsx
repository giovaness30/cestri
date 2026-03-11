'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

type GlobalContextType = {
  clickPicture: boolean
  setClickPicture: (clickPicture: boolean) => void
  showPreviewImage: boolean
  setShowPreviewImage: (showPreviewImage: boolean) => void
}

const GlobalContext = createContext<GlobalContextType | null>(null)

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [clickPicture, setClickPicture] = useState<boolean>(false)
  const [showPreviewImage, setShowPreviewImage] = useState<boolean>(true)

  useEffect(() => {
    if (clickPicture) {
      setTimeout(() => {
        setClickPicture(false)
      }, 1000)
    }
  }, [clickPicture])

  return (
    <GlobalContext.Provider value={{
      clickPicture,
      setClickPicture,
      showPreviewImage,
      setShowPreviewImage
    }}>
      {children}
    </GlobalContext.Provider>
  )
}

export function useGlobal() {
  const context = useContext(GlobalContext)

  if (!context) {
    throw new Error('useGlobal must be used inside GlobalProvider')
  }

  return context
}