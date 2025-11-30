import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from "@heroui/react"
import { useMemo, useState } from "react"
import Error from "./error"
import ClusterItem from "./item"
import Skeleton from "./skeleton"
import type {Cluster} from "@/features/clusters";
import {  useClusters } from "@/features/clusters"
import { Sentiment, useReviews } from "@/features/reviews"

interface ClustersListProps {
  analysisId: number
}

export default function ClustersList({ analysisId }: ClustersListProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null)

  const clusters = useClusters(analysisId)
  const reviews = useReviews(analysisId)

  const isLoading =
    clusters.status === "pending" || reviews.status === "pending"
  const isError = clusters.status === "error" || reviews.status === "error"

  const clusterStats = useMemo(() => {
    if (!clusters.data || !reviews.data) return {}

    const stats = clusters.data.reduce(
      (acc, cluster) => {
        acc[cluster.id] = {
          total: 0,
          [Sentiment.Positive]: 0,
          [Sentiment.Neutral]: 0,
          [Sentiment.Negative]: 0
        }
        return acc
      },
      {} as Record<number, { total: number } & Record<Sentiment, number>>
    )

    reviews.data.forEach((review) => {
      const stat = stats[review.cluster_id]
      if (stat) {
        stat.total += 1
        stat[review.sentiment] += 1
      }
    })

    return stats
  }, [clusters.data, reviews.data])

  if (isLoading) {
    return <Skeleton />
  }

  if (isError) {
    return (
      <Error
        message={
          (clusters.error as Error)?.message ||
          (reviews.error as Error)?.message
        }
      />
    )
  }

  if (!clusters.data.length) {
    return (
      <div className="text-center py-12 text-default-500">
        Кластеры не найдены
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clusters.data.map((cluster) => {
          const stats = clusterStats[cluster.id] || {
            total: 0,
            [Sentiment.Positive]: 0,
            [Sentiment.Neutral]: 0,
            [Sentiment.Negative]: 0
          }

          return (
            <ClusterItem
              key={cluster.id}
              cluster={cluster}
              stats={stats}
              onPress={() => {
                setSelectedCluster(cluster)
                onOpen()
              }}
            />
          )
        })}
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {selectedCluster?.title}
              </ModalHeader>
              <ModalBody>
                <p className="text-default-600 whitespace-pre-wrap">
                  {selectedCluster?.summary}
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  Закрыть
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
