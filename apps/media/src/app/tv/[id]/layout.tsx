import type { ReactNode } from 'react'

/** Props for the TV series detail layout with parallel modal slot. */
interface TVLayoutProps {
  /** The main page content. */
  children: ReactNode
  /** The modal slot — renders PhotoViewer when active, null by default. */
  modal: ReactNode
}

/**
 * Layout for the TV series detail route.
 *
 * Renders both the main content and the parallel `@modal` slot so that
 * intercepted photo routes can display the PhotoViewer as an overlay without
 * unmounting the underlying page.
 */
export default function TVLayout({ children, modal }: Readonly<TVLayoutProps>) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
