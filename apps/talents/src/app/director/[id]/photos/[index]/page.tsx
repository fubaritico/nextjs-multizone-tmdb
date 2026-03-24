import { Typography } from '@vite-mf-monorepo/ui'

/** Props for the director photos page. */
interface DirectorPhotosPageProps {
  /** Route params — id is the director ID, index is the photo index. */
  params: Promise<{ id: string; index: string }>
}

/** Placeholder page for director photos standalone route. */
export default async function DirectorPhotosPage({
  params,
}: DirectorPhotosPageProps) {
  const { id, index } = await params

  return (
    <div className="tl:flex tl:items-center tl:justify-center tl:py-20">
      <Typography variant="h1">
        Photos — Director {id} / {index} — Coming Soon
      </Typography>
    </div>
  )
}
