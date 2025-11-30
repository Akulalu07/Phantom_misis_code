import { Card, CardBody } from "@heroui/react"

export default function Error() {
  return (
    <Card className="border border-danger-200 bg-danger-50/20" shadow="none">
      <CardBody className="p-6 text-center text-danger">
        Ошибка при загрузке данных статистики
      </CardBody>
    </Card>
  )
}
