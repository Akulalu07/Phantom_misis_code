import { Skeleton as HeroSkeleton } from "@heroui/react"

export default function Skeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="p-3 rounded-large border border-default-200 flex gap-3 items-center bg-background h-[88px]"
        >
          <div className="flex flex-col gap-2 grow min-w-0">
            <HeroSkeleton className="rounded-lg w-3/4 h-5" />
            <div className="flex gap-2">
              <HeroSkeleton className="rounded-small w-12 h-6" />
              <HeroSkeleton className="rounded-small w-12 h-6" />
              <HeroSkeleton className="rounded-small w-12 h-6" />
            </div>
          </div>
          <HeroSkeleton className="w-5 h-5 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  )
}
