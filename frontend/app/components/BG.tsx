'use client';

import { getThemeFromPath } from "@/utils/theme";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function BG() {
  const pathname = usePathname();
  const THEME = getThemeFromPath(pathname);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div className={`fixed inset-0 -z-10 ${THEME.BACKGROUND}`} />,
    document.body
  );
}
