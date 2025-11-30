import { createFileRoute } from "@tanstack/react-router"
import { ReviewsClusters } from "@/widgets/reviews/clusters"
import { ClustersList } from "@/widgets/clusters/list"

export const Route = createFileRoute("/analyses/$analysisId/clusters")({
  component: RouteComponent
})

function RouteComponent() {
  const { analysisId } = Route.useParams()

  return (
    <div className="w-full flex flex-col gap-6">
      <section className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Распределение отзывов</h1>
        <ReviewsClusters analysisId={analysisId} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Кластеры</h2>
        <ClustersList analysisId={analysisId} />
      </section>
    </div>
  )
}
