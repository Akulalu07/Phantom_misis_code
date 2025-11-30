import { createFileRoute } from "@tanstack/react-router"
import { AnalysesOverview } from "@/widgets/analyses/overview"
import { ReviewsStatistics } from "@/widgets/reviews/statistics"

export const Route = createFileRoute("/analyses/$analysisId/")({
  component: AnalysisDashboard
})

function AnalysisDashboard() {
  const { analysisId } = Route.useParams()

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Action Section */}
      <section className="flex flex-col gap-4">
        <AnalysesOverview analysisId={analysisId} />
      </section>

      <section className="flex flex-col gap-4">
        <ReviewsStatistics analysisId={analysisId} />
      </section>
    </div>
  )
}
