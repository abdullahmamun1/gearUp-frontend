"use client"

import { createContext, useContext } from "react"

import type { JwtUser } from "@/types"

const SessionContext = createContext<JwtUser | null>(null)

export function SessionProvider({
  value,
  children,
}: {
  value: JwtUser | null
  children: React.ReactNode
}) {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}

export function useSession() {
  return useContext(SessionContext)
}

export function useRequiredSession() {
  const session = useSession()
  if (!session) {
    throw new Error("useRequiredSession must be used inside <SessionProvider>")
  }
  return session
}
