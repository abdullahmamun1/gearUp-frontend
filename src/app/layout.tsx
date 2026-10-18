/**
 * The real root layout (html, fonts, providers) is app/[locale]/layout.tsx,
 * so <html lang> follows the language. This one only exists because Next
 * needs a top-level layout for files like not-found.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
