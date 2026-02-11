'use client';

import { getThemeFromPath } from "@/utils/theme";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";

export default function BG() {
  const pathname = usePathname();
  const THEME = getThemeFromPath(pathname);

  return createPortal(
    <div className={`fixed inset-0 -z-10 ${THEME.BACKGROUND}`} />,
    document.body
  );
}
