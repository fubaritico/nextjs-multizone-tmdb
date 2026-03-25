/**
 * Default state for the movie `@modal` parallel slot.
 *
 * Returns null so no modal is rendered when no intercepting route is active.
 * Next.js requires this file to prevent a 404 on the parallel slot during
 * hard navigation.
 */
export default function ModalDefault() {
  return null
}
