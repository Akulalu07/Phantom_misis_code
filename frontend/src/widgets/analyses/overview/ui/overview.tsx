import { Card, CardBody, Chip } from "@heroui/react"
import {
  Angry,
  BarChart3,
  Calendar,
  Meh,
  Smile,
  TriangleAlert
} from "lucide-react"
import Skeleton from "./skeleton"
import Error from "./error"
import DeleteAnalysis from "./delete"
import Export from "./export"
import { useAnalysis } from "@/features/analyses"

interface OverviewProps {
  analysisId: number
}

export default function Overview({ analysisId }: OverviewProps) {
  const { data: analysis, status } = useAnalysis(analysisId)

  if (status === "pending") {
    return <Skeleton />
  }

  if (status === "error") {
    return <Error />
  }

  const stats = analysis.stats || {
    total: 0,
    positive: 0,
    negative: 0,
    neutral: 0
  }

  const statusColor = {
    done: "success",
    pending: "default",
    failed: "danger"
  }[analysis.status] as "success" | "default" | "danger"

  const statusLabel = {
    done: "Готово",
    pending: "В обработке",
    failed: "Ошибка"
  }[analysis.status]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1
              className="text-2xl font-bold truncate leading-tight"
              title={analysis.filename}
            >
              {analysis.filename}
            </h1>
            <Chip color={statusColor} variant="flat" size="sm">
              {statusLabel}
            </Chip>
          </div>
          <div className="flex items-center gap-2 text-small text-default-500">
            <Calendar className="w-4 h-4" />
            <span>{new Date(analysis.created_at).toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Export analysisId={analysis.id} />
          <DeleteAnalysis
            analysisId={analysis.id}
            filename={analysis.filename}
          />
        </div>
      </div>

      {analysis.status === "failed" && (
        <Card className="border-danger-200 bg-danger-50/20">
          <CardBody className="flex flex-row gap-4 items-start p-4">
            <TriangleAlert className="w-6 h-6 text-danger shrink-0 mt-1" />
            <div>
              <h3 className="text-medium font-semibold text-danger">
                Ошибка анализа
              </h3>
              <p className="text-small text-default-600 mt-1">
                {analysis.error ||
                  "Произошла неизвестная ошибка при обработке файла."}
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {analysis.status === "done" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-default-200 border" shadow="none">
            <CardBody className="p-4 flex flex-row items-center gap-4">
              <div className="p-3 rounded-large bg-default-100 text-default-600">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-tiny text-default-500 uppercase font-bold">
                  Всего
                </p>
                <p className="text-2xl font-semibold">{stats.total}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="border-default-200 border" shadow="none">
            <CardBody className="p-4 flex flex-row items-center gap-4">
              <div className="p-3 rounded-large bg-success-100 text-success-600">
                <Smile className="w-6 h-6" />
              </div>
              <div>
                <p className="text-tiny text-default-500 uppercase font-bold">
                  Позитивные
                </p>
                <p className="text-2xl font-semibold">{stats.positive}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="border-default-200 border" shadow="none">
            <CardBody className="p-4 flex flex-row items-center gap-4">
              <div className="p-3 rounded-large bg-warning-100 text-warning-600">
                <Meh className="w-6 h-6" />
              </div>
              <div>
                <p className="text-tiny text-default-500 uppercase font-bold">
                  Нейтральные
                </p>
                <p className="text-2xl font-semibold">{stats.neutral}</p>
              </div>
            </CardBody>
          </Card>

          <Card className="border-default-200 border" shadow="none">
            <CardBody className="p-4 flex flex-row items-center gap-4">
              <div className="p-3 rounded-large bg-danger-100 text-danger-600">
                <Angry className="w-6 h-6" />
              </div>
              <div>
                <p className="text-tiny text-default-500 uppercase font-bold">
                  Негативные
                </p>
                <p className="text-2xl font-semibold">{stats.negative}</p>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}
