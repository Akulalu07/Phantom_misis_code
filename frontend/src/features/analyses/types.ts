import type { Enum } from "@/shared/lib/utils/enum"

export const Status = {
  Pending: "pending",
  Done: "done",
  Failed: "failed"
}

export type Status = Enum<typeof Status>

export type Analysis = {
  id: number
  status: Status
  filename: string
  created_at: string
  error: string | null
  stats: {
    total: number
    positive: number
    negative: number
    neutral: number
  } | null
}
