import { Typography } from '@vite-mf-monorepo/ui'

/** Props for the actor photos page. */
interface ActorPhotosPageProps {
  /** Route params — id is the actor ID, index is the photo index. */
  params: Promise<{ id: string; index: string }>
}

/** Placeholder page for actor photos standalone route. */
export default async function ActorPhotosPage({
  params,
}: ActorPhotosPageProps) {
  const { id, index } = await params

  return (
    <div className="tl:flex tl:items-center tl:justify-center tl:py-20">
      <Typography variant="h1">
        Photos — Actor {id} / {index} — Coming Soon
      </Typography>
    </div>
  )
}
