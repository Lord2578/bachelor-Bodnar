"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import { cn } from "@/lib/utils"

type TabsContextValue = {
  selectedTab: string
  setSelectedTab: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

export function CustomTabs({
  defaultValue,
  children,
  className,
  ...props
}: {
  defaultValue: string
  children: React.ReactNode
  className?: string
}) {
  const [selectedTab, setSelectedTab] = useState(defaultValue)

  return (
    <TabsContext.Provider value={{ selectedTab, setSelectedTab }}>
      <div className={cn("space-y-4", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function CustomTabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex space-x-1 border-b", className)}>{children}</div>
}

export function CustomTabsTrigger({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const context = useContext(TabsContext)

  if (!context) {
    throw new Error("CustomTabsTrigger must be used within a CustomTabs")
  }

  const { selectedTab, setSelectedTab } = context
  const isActive = selectedTab === value

  return (
    <button
      className={cn(
        "px-4 py-2 text-sm font-medium transition-all",
        isActive ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground",
        className,
      )}
      onClick={() => setSelectedTab(value)}
    >
      {children}
    </button>
  )
}

export function CustomTabsContent({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const context = useContext(TabsContext)

  if (!context) {
    throw new Error("CustomTabsContent must be used within a CustomTabs")
  }

  const { selectedTab } = context

  if (selectedTab !== value) {
    return null
  }

  return <div className={cn("mt-4", className)}>{children}</div>
}

