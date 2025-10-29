import { ProjectDetailPageClient } from "./page-client"

export default function ProjectDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return <ProjectDetailPageClient projectId={params.id} />
}
