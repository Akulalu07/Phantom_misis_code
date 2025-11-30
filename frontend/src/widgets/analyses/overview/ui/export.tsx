import { Button } from "@heroui/react"
import { FileDown } from "lucide-react"
import { Sentiment, useReviews } from "@/features/reviews"

interface ExportProps {
  analysisId: number
}

const SENTIMENT_LABELS: Record<Sentiment, string> = {
  [Sentiment.Negative]: "0.0",
  [Sentiment.Neutral]: "1.0",
  [Sentiment.Positive]: "2.0"
}

export default function Export({ analysisId }: ExportProps) {
  const reviews = useReviews(analysisId)

  const handleExport = () => {
    if (!reviews.data) return

    const csvRows = [
      "ID,label",
      ...reviews.data.map((review) => {
        const label = SENTIMENT_LABELS[review.sentiment]
        return `${review.source_id},${label}`
      })
    ]

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `analysis_${analysisId}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Button
      color="primary"
      variant="light"
      startContent={<FileDown className="w-4 h-4" />}
      className="shrink-0"
      isLoading={reviews.status !== "success"}
      onPress={handleExport}
    >
      Скачать анализ
    </Button>
  )
}
