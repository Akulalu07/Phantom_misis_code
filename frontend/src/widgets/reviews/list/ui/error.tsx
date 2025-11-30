import { TriangleAlert } from "lucide-react"
import { Button } from "@heroui/react"
import { Link } from "@tanstack/react-router"

export default function Error() {
  return (
    <div className="w-full py-20 flex flex-col items-center justify-center gap-4 text-default-500 bg-content1 rounded-large border border-dashed border-default-200">
      <div className="p-4 rounded-full bg-danger/10 text-danger">
        <TriangleAlert className="w-12 h-12" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-xl font-semibold text-default-900">
          Ошибка загрузки анализа
        </p>
        <p className="text-default-500 max-w-sm mx-auto">
          Не удалось загрузить данные анализа. Возможно, он был удален или у вас
          нет доступа.
        </p>
      </div>
      <Button as={Link} to="/" variant="flat" color="primary" className="mt-2">
        Вернуться к списку
      </Button>
    </div>
  )
}
