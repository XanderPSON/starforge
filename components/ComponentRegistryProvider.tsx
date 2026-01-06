'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ComponentRegistry {
  activeIds: Set<string>
}

const ComponentRegistryContext = createContext<ComponentRegistry | null>(null)

export function ComponentRegistryProvider({ children }: { children: ReactNode }) {
  const [registry] = useState<ComponentRegistry>(() => ({
    activeIds: new Set<string>()
  }))

  return (
    <ComponentRegistryContext.Provider value={registry}>
      {children}
    </ComponentRegistryContext.Provider>
  )
}

export function useComponentRegistry(): ComponentRegistry {
  const registry = useContext(ComponentRegistryContext)
  if (!registry) {
    // Fallback to module-level Set if provider not found
    return { activeIds: new Set<string>() }
  }
  return registry
}
