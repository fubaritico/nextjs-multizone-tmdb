import { Typography } from '@vite-mf-monorepo/ui'

/** Props for the director detail page. */
interface DirectorPageProps {
  /** Route params — id is the TMDB director (person) ID. */
  params: Promise<{ id: string }>
}

/** Placeholder page for director detail route. */
export default async function DirectorPage({ params }: DirectorPageProps) {
  const { id } = await params

  return (
    <div className="tl:flex tl:items-center tl:justify-center tl:py-20">
      <Typography variant="h1">Director {id} — Coming Soon</Typography>
    </div>
  )
}
