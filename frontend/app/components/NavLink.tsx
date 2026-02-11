'use client'

import { cn } from '@/utils/className'
import { getThemeFromPath } from '@/utils/theme'
import Link from 'next/link'
import {usePathname} from 'next/navigation'

export default function NavLink({
  href,
  children,
  target,
  onClick,
  className,
  activeClassName
}: {
  href: string
  children?: React.ReactNode
  target?: string
  onClick?: () => void
  className?: string
  activeClassName?: string
}) {
  const pathname = usePathname()
  const isActive = pathname === href
  const THEME = getThemeFromPath(href)

  return (
    <Link
      href={href}
      target={target}
      onClick={onClick}
      className={cn(isActive && activeClassName, THEME.NAV_LINK, className)}
    >
      {children}
    </Link>
  )
}
