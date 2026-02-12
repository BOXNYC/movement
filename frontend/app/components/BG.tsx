import { getThemeFromPath } from "@/utils/theme";

export default function BG({ pathname }: { pathname: string }) {
  const THEME = getThemeFromPath(pathname);

  return (
    <div className={`fixed inset-0 -z-10 ${THEME.BACKGROUND}`} />
  );
}
