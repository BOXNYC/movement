'use client';

import { cn } from "@/utils/className";
import { getThemeFromPath } from "@/utils/theme";
import { usePathname } from "next/navigation";

export default function Container({ children, className }: { children: React.ReactNode, className?: string }) {
  const pathname = usePathname();
  const THEME = getThemeFromPath(pathname);
  return (
    <div className={cn('rounded-t-2xl md:rounded-t-[4rem] p-8 md:p-16', THEME.CONTAINER, className)}>
      {children}
    </div>
  )
}