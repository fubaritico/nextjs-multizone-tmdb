import { Typography } from '@vite-mf-monorepo/ui'
import Link from 'next/link'

/** Not-found page for actor detail routes. */
export default function ActorNotFound() {
  return (
    <div className="tl:flex tl:flex-col tl:items-center tl:gap-4 tl:py-20">
      <Typography variant="h2">Page not found</Typography>
      <Link
        href="/"
        className="tl:inline-flex tl:items-center tl:justify-center tl:rounded-md tl:bg-primary tl:px-4 tl:py-2 tl:font-medium tl:text-primary-foreground tl:hover:bg-primary/90"
      >
        Back to home
      </Link>
    </div>
  )
}
