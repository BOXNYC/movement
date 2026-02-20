import { cn } from "@/utils/className"

const subheadingClasses = 'text-6xl mt-4 leading-[0.85em] text-mvmnt-blue text-center uppercase font-robuck px-4';

export function Heading({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <h1 className={cn('text-6xl text-gray-900 lg:text-7xl text-center uppercase font-robuck', className)}>{children}</h1>
  )
}
export function Subheading({ children, className }: { children: React.ReactNode, className?: string }) {
  // if children is a string with a pipe, split it and wrap the first part in a span with a different color
  if (typeof children === 'string' && children.includes('|')) {
    const [first, second] = children.split('|')
    return (
      <h2 className={cn(subheadingClasses, 'flex flex-col', className)}>
        <span className="text-mvmnt-pink">{first}</span>
        {second && ` ${second}`}
      </h2>
    )
  }
  return (
    <h2 className={cn(subheadingClasses, className)}>{children}</h2>
  )
}