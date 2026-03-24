import type { ReactNode } from 'react'

/** Props for the director detail layout with parallel modal slot. */
interface DirectorLayoutProps {
  /** The main page content. */
  children: ReactNode
  /** The parallel modal slot (@modal). */
  modal: ReactNode
}

/**
 * Layout for director detail pages.
 * Wires the @modal parallel route slot alongside the main content.
 */
export default function DirectorLayout({
  children,
  modal,
}: DirectorLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
