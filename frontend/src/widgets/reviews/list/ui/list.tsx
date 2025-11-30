import { useEffect, useMemo, useState } from "react"
import { useDisclosure } from "@heroui/react"
import Filters from "./filters"
import ReviewsTable from "./table"
import Skeleton from "./skeleton"
import Error from "./error"
import ReviewModal from "./modal"
import type { Review } from "@/features/reviews/types"
import type { SharedSelection } from "@heroui/system"
import { useReviews } from "@/features/reviews"

interface ListProps {
  analysisId: number
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export default function List({ analysisId }: ListProps) {
  const { data: reviews, status } = useReviews(analysisId)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)

  const [searchValue, setSearchValue] = useState("")
  const debouncedSearch = useDebounce(searchValue, 300)

  const [sourceIdValue, setSourceIdValue] = useState("")
  const debouncedSourceId = useDebounce(sourceIdValue, 300)

  const [sentimentValue, setSentimentValue] = useState<SharedSelection>(
    new Set([])
  )
  const [sortValue, setSortValue] = useState<SharedSelection>(
    new Set(["confidence-desc"])
  )

  const filteredReviews = useMemo(() => {
    if (!reviews) return []

    let result = [...reviews]

    // Filter by text
    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase()
      result = result.filter((r) => r.text.toLowerCase().includes(lowerSearch))
    }

    // Filter by source_id
    if (debouncedSourceId) {
      const lowerSourceId = debouncedSourceId.toLowerCase()
      result = result.filter((r) =>
        r.source_id.toLowerCase().includes(lowerSourceId)
      )
    }

    // Filter by sentiment
    if (sentimentValue !== "all" && sentimentValue.size > 0) {
      result = result.filter((r) => sentimentValue.has(r.sentiment))
    }

    // Sort
    const sortKey =
      sortValue === "all"
        ? null
        : (Array.from(sortValue)[0] as string | undefined)

    if (sortKey) {
      if (sortKey === "confidence-desc") {
        result.sort((a, b) => b.confidence - a.confidence)
      } else if (sortKey === "confidence-asc") {
        result.sort((a, b) => a.confidence - b.confidence)
      }
    }

    return result
  }, [reviews, debouncedSearch, debouncedSourceId, sentimentValue, sortValue])

  if (status === "pending") {
    return <Skeleton />
  }

  if (status === "error") {
    return <Error />
  }

  return (
    <div className="space-y-4">
      <Filters
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        sourceIdValue={sourceIdValue}
        onSourceIdChange={setSourceIdValue}
        sentimentValue={sentimentValue}
        onSentimentChange={setSentimentValue}
        sortValue={sortValue}
        onSortChange={setSortValue}
      />
      <ReviewsTable
        reviews={filteredReviews}
        onRowClick={(review) => {
          setSelectedReview(review)
          onOpen()
        }}
      />
      <ReviewModal review={selectedReview} isOpen={isOpen} onClose={onClose} />
    </div>
  )
}
