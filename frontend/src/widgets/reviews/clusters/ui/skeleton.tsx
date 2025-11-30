import { Skeleton as HeroSkeleton } from "@heroui/react"

export default function Skeleton() {
  return (
    <div className="h-[600px] w-full rounded-large border border-default-200 p-4 bg-content1">
      <HeroSkeleton className="h-full w-full rounded-lg" />
    </div>
  )
}
