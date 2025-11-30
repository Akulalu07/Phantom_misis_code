import { createFileRoute } from "@tanstack/react-router"
import { ReviewsList } from "@/widgets/reviews/list"

export const Route = createFileRoute("/analyses/$analysisId/reviews")({
  component: RouteComponent
})

function RouteComponent() {
  const { analysisId } = Route.useParams()

  return <ReviewsList analysisId={analysisId} />
}
