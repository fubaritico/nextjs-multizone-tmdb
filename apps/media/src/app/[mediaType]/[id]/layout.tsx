import type { ReactNode } from 'react'

/** Props for the media detail layout with parallel modal slot. */
interface MediaLayoutProps {
  /** The main page content. */
  children: ReactNode
  /** The modal slot — renders PhotoViewer when active, null by default. */
  modal: ReactNode
}

/**
 * Layout for the media detail route (`/movie/[id]` or `/tv/[id]`).
 *
 * Renders both the main content and the parallel `@modal` slot so that
 * photo routes display the PhotoViewer as an overlay without unmounting
 * the underlying page.
 */
export default function MediaLayout({
  children,
  modal,
}: Readonly<MediaLayoutProps>) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
