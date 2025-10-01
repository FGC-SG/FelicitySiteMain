import { createContext, useContext, useEffect, useState } from "react"

type Layout = "desktop" | "mobile"

type LayoutProviderProps = {
  children: React.ReactNode
  defaultLayout?: Layout
  storageKey?: string
}

type LayoutProviderState = {
  layout: Layout
  setLayout: (layout: Layout) => void
}

const initialState: LayoutProviderState = {
  layout: "desktop",
  setLayout: () => null,
}

const LayoutProviderContext = createContext<LayoutProviderState>(initialState)

export function LayoutProvider({
  children,
  defaultLayout = "desktop",
  storageKey = "vite-ui-layout",
  ...props
}: LayoutProviderProps) {
  const [layout, setLayout] = useState<Layout>(
    () => (localStorage.getItem(storageKey) as Layout) || defaultLayout
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("force-desktop", "force-mobile")

    if (layout === "mobile") {
      root.classList.add("force-mobile")
    } else if (layout === "desktop") {
      root.classList.add("force-desktop")
    }
  }, [layout])

  const value = {
    layout,
    setLayout: (layout: Layout) => {
      localStorage.setItem(storageKey, layout)
      setLayout(layout)
    },
  }

  return (
    <LayoutProviderContext.Provider {...props} value={value}>
      {children}
    </LayoutProviderContext.Provider>
  )
}

export const useLayout = () => {
  const context = useContext(LayoutProviderContext)

  if (context === undefined)
    throw new Error("useLayout must be used within a LayoutProvider")

  return context
}
