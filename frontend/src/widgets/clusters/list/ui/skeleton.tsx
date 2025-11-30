import { Skeleton as HeroSkeleton } from "@heroui/react"

export default function Skeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-4 rounded-large border border-default-200 p-4 bg-content1"
        >
          <div className="flex justify-between items-start gap-4">
            <HeroSkeleton className="h-6 w-3/4 rounded-lg" />
            <HeroSkeleton className="h-6 w-8 rounded-lg" />
          </div>

          <div className="space-y-2">
            <HeroSkeleton className="h-4 w-full rounded-lg" />
            <HeroSkeleton className="h-4 w-5/6 rounded-lg" />
            <HeroSkeleton className="h-4 w-4/6 rounded-lg" />
          </div>

          <div className="flex gap-2 mt-auto pt-2">
            <HeroSkeleton className="h-6 w-16 rounded-full" />
            <HeroSkeleton className="h-6 w-16 rounded-full" />
            <HeroSkeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
