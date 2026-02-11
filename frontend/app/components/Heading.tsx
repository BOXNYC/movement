import { cn } from "@/utils/className"

export function Heading({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <h1 className={cn('text-6xl text-gray-900 sm:text-5xl lg:text-7xl text-center uppercase font-robuck', className)}>{children}</h1>
  )
}
export function Subheading({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <h2 className={cn('text-6xl mt-4 leading-[0.85em] text-gray-600 text-center uppercase font-robuck', className)}>{children}</h2>
  )
}