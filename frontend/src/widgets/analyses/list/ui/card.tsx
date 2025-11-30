import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollShadow
} from "@heroui/react"
import {
  Angry,
  ChevronRight,
  Loader,
  Meh,
  Smile,
  TriangleAlert
} from "lucide-react"
import { Link } from "@tanstack/react-router"
import type { Analysis } from "@/features/analyses"
import { cn } from "@/shared/lib/utils/tailwind"

interface CardProps {
  analysis: Analysis
}

export default function Card({ analysis }: CardProps) {
  const isDone = analysis.status === "done"
  const isFailed = analysis.status === "failed"
  const isPending = analysis.status === "pending"

  const content = (
    <>
      <div className="flex flex-col gap-2 grow min-w-0">
        <div
          className="text-base font-semibold truncate"
          title={analysis.filename}
        >
          {analysis.filename}
        </div>
        <ScrollShadow orientation="horizontal" className="flex gap-2 w-full">
          <div className="px-2 py-1 rounded-small text-tiny flex gap-1 items-center bg-success text-success-foreground shrink-0">
            <Smile className="w-3.5 h-3.5 shrink-0" />
            <span>{analysis.stats?.positive ?? "—"}</span>
          </div>
          <div className="px-2 py-1 rounded-small text-tiny flex gap-1 items-center bg-warning text-warning-foreground shrink-0">
            <Meh className="w-3.5 h-3.5 shrink-0" />
            <span>{analysis.stats?.neutral ?? "—"}</span>
          </div>
          <div className="px-2 py-1 rounded-small text-tiny flex gap-1 items-center bg-danger text-danger-foreground shrink-0">
            <Angry className="w-3.5 h-3.5 shrink-0" />
            <span>{analysis.stats?.negative ?? "—"}</span>
          </div>
        </ScrollShadow>
      </div>

      {isDone && (
        <ChevronRight className="ml-2 w-5 h-5 text-default-400 shrink-0" />
      )}

      {isPending && (
        <Loader className="ml-2 w-5 h-5 text-default-400 animate-spin shrink-0" />
      )}

      {isFailed && (
        <Popover placement="bottom-end" showArrow offset={10}>
          <PopoverTrigger>
            <Button
              variant="light"
              color="danger"
              isIconOnly
              className="ml-2 shrink-0"
              size="sm"
            >
              <TriangleAlert className="w-5 h-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-3 items-start">
            <div className="text-small font-bold mb-1 text-danger">
              Ошибка анализа
            </div>
            <div className="text-tiny text-default-600 leading-relaxed">
              {analysis.error ||
                "Произошла неизвестная ошибка при обработке файла."}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </>
  )

  const baseClassName = cn(
    "group relative p-3 rounded-large border transition-all duration-200 flex gap-3 items-center",
    "bg-background",

    isDone
      ? "border-default-200 hover:border-default-400 cursor-pointer"
      : "border-default-200",
    isPending && "opacity-80 bg-default-50",
    isFailed && "border-danger-200 bg-danger-50/20"
  )

  if (isDone) {
    return (
      <Link
        to="/analyses/$analysisId"
        params={{ analysisId: analysis.id }}
        className={baseClassName}
      >
        {content}
      </Link>
    )
  }

  return <div className={baseClassName}>{content}</div>
}
