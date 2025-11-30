import { Inbox } from "lucide-react"
import Skeleton from "./skeleton"
import Error from "./error"
import Card from "./card"
import { useAnalyses } from "@/features/analyses"

export default function List() {
  const { data: analyses, status } = useAnalyses()

  if (status === "pending") {
    return <Skeleton />
  }

  if (status === "error") {
    return <Error />
  }

  if (analyses.length === 0) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center gap-4 text-default-400 border border-dashed border-default-200 rounded-large bg-content1/50">
        <div className="p-4 rounded-full bg-default-100">
          <Inbox className="w-8 h-8" />
        </div>
        <p className="text-medium font-medium">Список анализов пуст</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {analyses.map((analysis) => (
        <Card key={analysis.id} analysis={analysis} />
      ))}
    </div>
  )
}
