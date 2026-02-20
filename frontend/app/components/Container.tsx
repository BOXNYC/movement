'use client';

import { cn } from "@/utils/className";
import { getThemeFromPath } from "@/utils/theme";
import { usePathname } from "next/navigation";

export default function Container({ children, className }: { children: React.ReactNode, className?: string }) {
  const pathname = usePathname();
  const THEME = getThemeFromPath(pathname);
  return (
    <>
      <div className={cn(
        'max-w-5xl mx-auto rounded-2xl md:rounded-[4rem] mb-12',
        ['/services', '/people-culture'].includes(pathname) ? 'py-8 md:py-16' : 'p-8 md:p-16',
        THEME.CONTAINER,
      className)}>
        {children}
      </div>
      <div className="text-xs text-center text-muted">
        @2026 Movement. All rights reserved. <br className="md:hidden" />
        <a className="opacity-50 mx-2" href="https://www.movementstrategy.com/terms-of-use" target="_blank">Terms of Use</a>
        •
        <a className="opacity-50 mx-2" href="https://www.movementstrategy.com/privacy-policy" target="_blank">Privacy Policy</a>
      </div>
    </>
  )
}