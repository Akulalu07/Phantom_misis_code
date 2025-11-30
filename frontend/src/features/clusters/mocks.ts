import type { Cluster } from "./types"

export const mockClusters: Array<Cluster> = [
  {
    id: 1,
    analysis_id: 1,
    title: "Performance Issues",
    summary:
      "Users are reporting slow loading times and crashes after the latest update."
  },
  {
    id: 2,
    analysis_id: 1,
    title: "Feature Requests",
    summary:
      "Many users are asking for dark mode and better integration with calendar apps."
  },
  {
    id: 3,
    analysis_id: 1,
    title: "Pricing Concerns",
    summary:
      "Several reviews mention that the subscription cost is too high compared to competitors."
  }
]
