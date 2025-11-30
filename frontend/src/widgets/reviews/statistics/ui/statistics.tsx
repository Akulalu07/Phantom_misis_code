import { useMemo, useState } from "react"
import ReactECharts from "echarts-for-react"
import { Card, CardBody, CardHeader, Select, SelectItem } from "@heroui/react"
import Skeleton from "./skeleton"
import Error from "./error"
import type { SharedSelection } from "@heroui/system"
import { Sentiment, useReviews } from "@/features/reviews"

interface StatisticsProps {
  analysisId: number
}

export default function Statistics({ analysisId }: StatisticsProps) {
  const { data: reviews, status } = useReviews(analysisId)
  const [selectedKeys, setSelectedKeys] = useState<SharedSelection>(
    new Set(["all"])
  )

  const selectedSource = useMemo(() => {
    const key = Array.from(selectedKeys)[0]
    return key ? String(key) : "all"
  }, [selectedKeys])

  const sources = useMemo(() => {
    if (!reviews) return []
    return Array.from(new Set(reviews.map((r) => r.source_id))).sort()
  }, [reviews])

  const sourceOptions = useMemo(() => {
    return [
      { key: "all", label: "Все источники" },
      ...sources.map((s) => ({ key: s, label: s }))
    ]
  }, [sources])

  const chartData = useMemo(() => {
    if (!reviews) return { positive: 0, neutral: 0, negative: 0 }

    const filtered =
      selectedSource === "all"
        ? reviews
        : reviews.filter((r) => r.source_id === selectedSource)

    return filtered.reduce(
      (acc, review) => {
        if (review.sentiment === Sentiment.Positive) acc.positive++
        else if (review.sentiment === Sentiment.Neutral) acc.neutral++
        else if (review.sentiment === Sentiment.Negative) acc.negative++
        return acc
      },
      { positive: 0, neutral: 0, negative: 0 }
    )
  }, [reviews, selectedSource])

  const option = useMemo(() => {
    return {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow"
        },
        padding: 0,
        borderWidth: 0,
        borderColor: "transparent",
        backgroundColor: "transparent",
        extraCssText: "box-shadow: none;",
        formatter: (params: any) => {
          const item = Array.isArray(params) ? params[0] : params
          const { name, value, color } = item

          return `
            <div style="background: white; border: 1px solid #e4e4e7; border-radius: 12px; padding: 12px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); min-width: 200px; font-family: inherit;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${color};"></span>
                <span style="font-weight: 600; font-size: 12px; color: #71717a;">ТОНАЛЬНОСТЬ</span>
                <span style="margin-left: auto; font-size: 10px; padding: 2px 6px; border-radius: 9999px; background-color: ${color}20; color: ${color}; font-weight: 600; text-transform: uppercase;">
                  ${name}
                </span>
              </div>
              <div style="display: flex; align-items: baseline; gap: 4px;">
                <span style="font-size: 24px; font-weight: 700; color: #18181b; line-height: 1;">${value}</span>
                <span style="font-size: 12px; font-weight: 500; color: #71717a;">отзывов</span>
              </div>
            </div>
          `
        }
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true
      },
      xAxis: [
        {
          type: "category",
          data: ["Позитивные", "Нейтральные", "Негативные"],
          axisTick: {
            alignWithLabel: true
          }
        }
      ],
      yAxis: [
        {
          type: "value"
        }
      ],
      series: [
        {
          name: "Количество",
          type: "bar",
          barWidth: "60%",
          data: [
            {
              value: chartData.positive,
              itemStyle: { color: "#17c964" }
            },
            {
              value: chartData.neutral,
              itemStyle: { color: "#f5a524" }
            },
            {
              value: chartData.negative,
              itemStyle: { color: "#f31260" }
            }
          ]
        }
      ]
    }
  }, [chartData])

  if (status === "pending") {
    return <Skeleton />
  }

  if (status === "error") {
    return <Error />
  }

  return (
    <Card className="border border-default-200" shadow="none">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-6 pt-6 pb-0">
        <h3 className="text-lg font-semibold">Статистика тональности</h3>
        <Select
          aria-label="Выберите источник"
          className="max-w-xs"
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          disallowEmptySelection
          items={sourceOptions}
        >
          {(item) => <SelectItem key={item.key}>{item.label}</SelectItem>}
        </Select>
      </CardHeader>
      <CardBody className="p-6">
        <div className="w-full h-[400px]">
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
