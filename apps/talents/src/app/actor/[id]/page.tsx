import { Typography } from '@vite-mf-monorepo/ui'

/** Props for the actor detail page. */
interface ActorPageProps {
  /** Route params — id is the TMDB actor ID. */
  params: Promise<{ id: string }>
}

/** Placeholder page for actor detail route. */
export default async function ActorPage({ params }: ActorPageProps) {
  const { id } = await params

  return (
    <div className="tl:flex tl:items-center tl:justify-center tl:py-20">
      <Typography variant="h1">Actor {id} — Coming Soon</Typography>
    </div>
  )
}
