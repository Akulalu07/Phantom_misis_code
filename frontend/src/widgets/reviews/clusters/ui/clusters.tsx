import { useMemo } from "react"
import ReactECharts from "echarts-for-react"
import { Card, CardBody } from "@heroui/react"
import Skeleton from "./skeleton"
import Error from "./error"
import type {Review} from "@/features/reviews";
import {  Sentiment, useReviews } from "@/features/reviews"
import { generateClusterColor } from "@/features/clusters"

interface ClustersProps {
  analysisId: number
}

export default function Clusters({ analysisId }: ClustersProps) {
  const { data: reviews, status } = useReviews(analysisId)

  const sentimentLabelMap: Record<Sentiment, string> = {
    [Sentiment.Positive]: "Позитивный",
    [Sentiment.Neutral]: "Нейтральный",
    [Sentiment.Negative]: "Негативный"
  }

  const option = useMemo(() => {
    if (!reviews) return {}

    const clusters = new Map<number, Array<Review>>()

    reviews.forEach((review) => {
      if (review.coords) {
        if (!clusters.has(review.cluster_id)) {
          clusters.set(review.cluster_id, [])
        }
        clusters.get(review.cluster_id)?.push(review)
      }
    })

    const sortedClusterIds = Array.from(clusters.keys()).sort((a, b) => a - b)

    const series = sortedClusterIds.map((clusterId) => {
      const clusterReviews = clusters.get(clusterId) || []
      return {
        name: `Кластер ${clusterId}`,
        type: "scatter",
        symbolSize: 8,
        itemStyle: {
          color: generateClusterColor(clusterId)
        },
        data: clusterReviews.map((review) => [
          review.coords.x,
          review.coords.y,
          review
        ]),
        emphasis: {
          focus: "series"
        }
      }
    })

    return {
      grid: {
        top: 40,
        right: 40,
        bottom: 40,
        left: 40,
        containLabel: true
      },
      tooltip: {
        trigger: "item",
        padding: 0,
        borderWidth: 0,
        borderColor: "transparent",
        backgroundColor: "transparent",
        extraCssText: "box-shadow: none;",
        formatter: (params: any) => {
          const review = params.data[2] as Review
          const sentimentLabel = sentimentLabelMap[review.sentiment]
          const color = params.color
          const sentimentColor =
            review.sentiment === "positive"
              ? "#17c964"
              : review.sentiment === "negative"
                ? "#f31260"
                : "#f5a524"

          return `
            <div style="background: white; border: 1px solid #e4e4e7; border-radius: 12px; padding: 12px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); max-width: 300px; font-family: inherit;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${color};"></span>
                <span style="font-weight: 600; font-size: 12px; color: #71717a;">КЛАСТЕР ${review.cluster_id}</span>
                <span style="margin-left: auto; font-size: 10px; padding: 2px 6px; border-radius: 9999px; background-color: ${sentimentColor}20; color: ${sentimentColor}; font-weight: 600; text-transform: uppercase;">
                  ${sentimentLabel}
                </span>
              </div>
              <div style="font-size: 14px; color: #18181b; line-height: 1.5; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 8px;">
                ${review.text}
              </div>
              <div style="font-size: 11px; color: #a1a1aa;">
                ID: ${review.id} • Уверенность: ${(review.confidence * 100).toFixed(0)}%
              </div>
            </div>
          `
        }
      },
      xAxis: {
        type: "value",
        scale: true,
        splitLine: {
          lineStyle: {
            type: "dashed",
            color: "#f4f4f5"
          }
        },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#a1a1aa" }
      },
      yAxis: {
        type: "value",
        scale: true,
        splitLine: {
          lineStyle: {
            type: "dashed",
            color: "#f4f4f5"
          }
        },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#a1a1aa" }
      },
      dataZoom: [
        {
          type: "inside",
          xAxisIndex: [0],
          yAxisIndex: [0]
        }
      ],
      legend: {
        show: false
      },
      series
    }
  }, [reviews])

  if (status === "pending") {
    return <Skeleton />
  }

  if (status === "error") {
    return <Error />
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card className="border-default-200 border" shadow="none">
        <CardBody className="p-10 flex justify-center items-center text-default-500">
          Нет данных для отображения
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="border-default-200 border" shadow="none">
      <CardBody className="p-4">
        <div className="h-[600px] w-full">
          <ReactECharts
            option={option}
            style={{ height: "100%", width: "100%" }}
            opts={{ renderer: "svg" }}
          />
        </div>
      </CardBody>
    </Card>
  )
}
