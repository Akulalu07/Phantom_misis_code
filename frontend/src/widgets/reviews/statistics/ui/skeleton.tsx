import {
  Card,
  CardBody,
  CardHeader,
  Skeleton as HeroSkeleton
} from "@heroui/react"

export default function Skeleton() {
  return (
    <Card className="border border-default-200" shadow="none">
      <CardHeader className="flex flex-row justify-between items-center gap-4 px-6 pt-6">
        <HeroSkeleton className="h-8 w-48 rounded-lg" />
        <HeroSkeleton className="h-10 w-40 rounded-lg" />
      </CardHeader>
      <CardBody className="p-6">
        <HeroSkeleton className="h-[300px] w-full rounded-lg" />
      </CardBody>
    </Card>
  )
}
