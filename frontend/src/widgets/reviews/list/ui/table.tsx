import { useRef } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { ScrollShadow } from "@heroui/react"
import ReviewRow from "./row"
import type { Review } from "@/features/reviews/types"

interface ReviewsTableProps {
  reviews: Array<Review>
  onRowClick: (review: Review) => void
}

export default function ReviewsTable({
  reviews,
  onRowClick
}: ReviewsTableProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: reviews.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5
  })

  return (
    <div className="flex flex-col border border-default-200 rounded-medium overflow-hidden h-[600px] bg-content1">
      {/* Table Header */}
      <div className="flex items-center h-12 px-4 border-b border-default-200 bg-default-100 shrink-0 z-10 font-medium text-small text-default-500">
        <div className="w-[150px] shrink-0 pr-4">Источник</div>
        <div className="flex-1 min-w-0 pr-4">Текст отзыва</div>
        <div className="w-[150px] shrink-0 pr-4">Тональность</div>
        <div className="w-[120px] shrink-0 text-right">Уверенность</div>
      </div>

      {/* Virtual List */}
      <ScrollShadow
        ref={parentRef}
        className="flex-1 overflow-auto"
        hideScrollBar
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative"
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => (
            <ReviewRow
              key={virtualRow.key}
              review={reviews[virtualRow.index]}
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`
              }}
              onClick={onRowClick}
            />
          ))}
        </div>
      </ScrollShadow>
    </div>
  )
}
