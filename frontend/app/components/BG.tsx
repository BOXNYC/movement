'use client';

import { getThemeFromPath } from "@/utils/theme";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function BG() {
  const pathname = usePathname();
  const THEME = getThemeFromPath(pathname);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setContainer(document.body);
  }, []);

  if (!container) {
    return null;
  }

  return createPortal(
    <div className={`fixed inset-0 -z-10 ${THEME.BACKGROUND}`} />,
    container
  );
}
