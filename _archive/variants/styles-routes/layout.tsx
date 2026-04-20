/**
 * /styles/* route group — bypasses the site's (marketing) Nav/Footer so
 * each variant can present a fully immersive, theme-consistent experience.
 * Once a winner variant is promoted to the main site, this whole tree is deleted.
 */
export default function StylesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
