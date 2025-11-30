import { Status } from "./types"
import type { Analysis } from "./types"

export const mockAnalyses: Array<Analysis> = [
  {
    id: 1,
    status: Status.Done,
    filename: "reviews_january.csv",
    created_at: "2023-10-26T10:00:00Z",
    error: null,
    stats: {
      total: 150,
      positive: 80,
      negative: 40,
      neutral: 30
    }
  },
  {
    id: 2,
    status: Status.Pending,
    filename: "feedback_v2.csv",
    created_at: "2023-10-27T14:30:00Z",
    error: null,
    stats: null
  },
  {
    id: 3,
    status: Status.Failed,
    filename: "corrupted_data.csv",
    created_at: "2023-10-25T09:15:00Z",
    error: "File format not supported",
    stats: null
  },
  {
    id: 4,
    status: Status.Done,
    filename: "app_store_reviews.csv",
    created_at: "2023-10-28T11:45:00Z",
    error: null,
    stats: {
      total: 500,
      positive: 350,
      negative: 50,
      neutral: 100
    }
  }
]
