import { Skeleton as HeroSkeleton } from "@heroui/react"

export default function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <HeroSkeleton className="h-8 w-64 rounded-lg" />
          <HeroSkeleton className="h-4 w-40 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <HeroSkeleton className="h-10 w-10 rounded-medium" />
          <HeroSkeleton className="h-10 w-24 rounded-medium" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-large border border-default-200 p-4 bg-content1"
          >
            <HeroSkeleton className="h-4 w-24 rounded-lg" />
            <HeroSkeleton className="h-8 w-16 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="rounded-large border border-default-200 p-6 bg-content1">
        <div className="space-y-4">
          <HeroSkeleton className="h-6 w-48 rounded-lg" />
          <HeroSkeleton className="h-[300px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
