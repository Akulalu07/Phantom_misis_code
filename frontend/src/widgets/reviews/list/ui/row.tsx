import { memo } from "react"
import { Chip } from "@heroui/react"
import type { Review } from "@/features/reviews/types"
import { Sentiment } from "@/features/reviews/types"

interface ReviewRowProps {
  review: Review
  style: React.CSSProperties
  onClick: (review: Review) => void
}

const sentimentColorMap: Record<Sentiment, "success" | "warning" | "danger"> = {
  [Sentiment.Positive]: "success",
  [Sentiment.Neutral]: "warning",
  [Sentiment.Negative]: "danger"
}

const sentimentLabelMap: Record<Sentiment, string> = {
  [Sentiment.Positive]: "Позитивный",
  [Sentiment.Neutral]: "Нейтральный",
  [Sentiment.Negative]: "Негативный"
}

const ReviewRow = memo(({ review, style, onClick }: ReviewRowProps) => {
  return (
    <div
      style={style}
      className="absolute top-0 left-0 w-full flex items-center border-b border-default-200 px-4 hover:bg-default-50 transition-colors cursor-pointer"
      onClick={() => onClick(review)}
    >
      {/* Source ID */}
      <div className="w-[150px] shrink-0 pr-4">
        <p className="text-small font-medium truncate" title={review.source_id}>
          {review.source_id}
        </p>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-small text-default-600 truncate" title={review.text}>
          {review.text}
        </p>
      </div>

      {/* Sentiment */}
      <div className="w-[150px] shrink-0 pr-4">
        <Chip
          color={sentimentColorMap[review.sentiment]}
          variant="flat"
          size="sm"
          className="capitalize"
        >
          {sentimentLabelMap[review.sentiment]}
        </Chip>
      </div>

      {/* Confidence */}
      <div className="w-[120px] shrink-0 text-right">
        <p className="text-small text-default-500">
          {(review.confidence * 100).toFixed(1)}%
        </p>
      </div>
    </div>
  )
})

ReviewRow.displayName = "ReviewRow"

export default ReviewRow
