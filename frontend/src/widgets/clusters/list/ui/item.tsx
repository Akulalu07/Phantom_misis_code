import { Card, CardBody, CardHeader, Chip } from "@heroui/react"
import { Angry, Meh, Smile } from "lucide-react"
import type {Cluster} from "@/features/clusters";
import {  generateClusterColor } from "@/features/clusters"
import { Sentiment } from "@/features/reviews"

interface ClusterItemProps {
  cluster: Cluster
  stats: {
    total: number
    [Sentiment.Positive]: number
    [Sentiment.Neutral]: number
    [Sentiment.Negative]: number
  }
  onPress?: () => void
}

export default function ClusterItem({
  cluster,
  stats,
  onPress
}: ClusterItemProps) {
  const color = generateClusterColor(cluster.id)

  return (
    <Card
      isPressable={!!onPress}
      onPress={onPress}
      className="border border-default-200"
      shadow="none"
    >
      <CardHeader className="flex justify-between items-start gap-3 pb-2">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-4 h-4 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <h3
            className="text-medium font-semibold truncate"
            title={cluster.title}
          >
            {cluster.title}
          </h3>
        </div>
        <Chip size="sm" variant="flat">
          {stats.total}
        </Chip>
      </CardHeader>
      <CardBody className="pt-0 gap-4">
        <p className="text-small text-default-500 line-clamp-3">
          {cluster.summary}
        </p>

        <div className="flex items-center gap-4 mt-auto">
          <div className="flex items-center gap-1.5" title="Позитивные">
            <Smile className="w-4 h-4 text-success" />
            <span className="text-small font-medium">
              {stats[Sentiment.Positive]}
            </span>
          </div>
          <div className="flex items-center gap-1.5" title="Нейтральные">
            <Meh className="w-4 h-4 text-warning" />
            <span className="text-small font-medium">
              {stats[Sentiment.Neutral]}
            </span>
          </div>
          <div className="flex items-center gap-1.5" title="Негативные">
            <Angry className="w-4 h-4 text-danger" />
            <span className="text-small font-medium">
              {stats[Sentiment.Negative]}
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
