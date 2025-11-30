import { Button, Card, CardBody } from "@heroui/react"
import { AlertCircle, RotateCcw } from "lucide-react"

interface ErrorProps {
  message?: string
  onRetry?: () => void
}

export default function Error({ message, onRetry }: ErrorProps) {
  return (
    <Card className="border-danger-200 bg-danger-50/20" shadow="none">
      <CardBody className="flex flex-row gap-4 items-center p-4">
        <AlertCircle className="w-6 h-6 text-danger shrink-0" />
        <div className="flex-1">
          <h3 className="text-medium font-semibold text-danger">
            Ошибка загрузки
          </h3>
          <p className="text-small text-default-600 mt-1">
            {message ||
              "Не удалось загрузить список кластеров. Попробуйте обновить страницу."}
          </p>
        </div>
        {onRetry && (
          <Button
            size="sm"
            color="danger"
            variant="flat"
            onPress={onRetry}
            startContent={<RotateCcw className="w-4 h-4" />}
          >
            Повторить
          </Button>
        )}
      </CardBody>
    </Card>
  )
}
