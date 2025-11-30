import { TriangleAlert } from "lucide-react"

export default function Error() {
  return (
    <div className="w-full py-12 flex flex-col items-center justify-center gap-3 text-default-500 bg-content1 rounded-large border border-dashed border-default-200">
      <div className="text-danger">
        <TriangleAlert className="w-12 h-12" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-medium font-medium text-default-900">
          Ошибка загрузки
        </p>
        <p className="text-small max-w-xs mx-auto">
          Не удалось получить список анализов. Пожалуйста, попробуйте позже.
        </p>
      </div>
    </div>
  )
}
