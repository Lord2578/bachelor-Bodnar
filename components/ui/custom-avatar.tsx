import type React from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"

export function CustomAvatar({
  className,
  ...props
}: {
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props} />
}

export function CustomAvatarImage({
  className,
  src,
  alt = "",
  ...props
}: {
  className?: string
  src: string
  alt?: string
} & Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'width' | 'height'>) {
  return (
    <Image
      src={src || "/placeholder.svg"}
      alt={alt}
      width={40}
      height={40}
      className={cn("aspect-square h-full w-full", className)}
      {...props}
    />
  )
}

export function CustomAvatarFallback({
  className,
  children,
  ...props
}: {
  className?: string
  children: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)} {...props}>
      {children}
    </div>
  )
}

