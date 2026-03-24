import type { ReactNode } from 'react'

/** Props for the actor detail layout with parallel modal slot. */
interface ActorLayoutProps {
  /** The main page content. */
  children: ReactNode
  /** The parallel modal slot (@modal). */
  modal: ReactNode
}

/**
 * Layout for actor detail pages.
 * Wires the @modal parallel route slot alongside the main content.
 */
export default function ActorLayout({ children, modal }: ActorLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
