import type { Enum } from "@/shared/lib/utils/enum"

export const Sentiment = {
  Positive: "positive",
  Neutral: "neutral",
  Negative: "negative"
}

export type Sentiment = Enum<typeof Sentiment>

export type Review = {
  id: number
  analysis_id: number
  source_id: string
  text: string
  sentiment: Sentiment
  confidence: number
  cluster_id: number
  coords: { x: number; y: number }
}

export type ReviewUpdate = {
  sentiment?: Sentiment
}
