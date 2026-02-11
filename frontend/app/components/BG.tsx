'use client';

import { getThemeFromPath } from "@/utils/theme";
import { usePathname } from "next/navigation";

export default function BG() {
  const pathname = usePathname();
  const THEME = getThemeFromPath(pathname);

  return (
    <div className={`fixed inset-0 -z-10 ${THEME.BACKGROUND}`} />
  );
}
