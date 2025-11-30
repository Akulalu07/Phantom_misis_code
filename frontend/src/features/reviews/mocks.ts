import { Sentiment } from "./types"
import type { Review } from "./types"

export const mockReviews: Array<Review> = [
  {
    id: 1,
    analysis_id: 1,
    source_id: "1",
    text: "This app is amazing! I use it every day.",
    sentiment: Sentiment.Positive,
    confidence: 0.95,
    cluster_id: 1,
    coords: { x: 10, y: 15 }
  },
  {
    id: 2,
    analysis_id: 1,
    source_id: "2",
    text: "The new update caused the app to crash frequently.",
    sentiment: Sentiment.Negative,
    confidence: 0.85,
    cluster_id: 2,
    coords: { x: -20, y: 5 }
  },
  {
    id: 3,
    analysis_id: 1,
    source_id: "3",
    text: "It's okay, but it lacks some features found in competitors.",
    sentiment: Sentiment.Neutral,
    confidence: 0.6,
    cluster_id: 3,
    coords: { x: 5, y: -10 }
  },
  {
    id: 4,
    analysis_id: 1,
    source_id: "4",
    text: "Great customer support, they resolved my issue quickly.",
    sentiment: Sentiment.Positive,
    confidence: 0.9,
    cluster_id: 1,
    coords: { x: 12, y: 18 }
  },
  {
    id: 5,
    analysis_id: 1,
    source_id: "5",
    text: "I'm extremely frustrated with the billing process.",
    sentiment: Sentiment.Negative,
    confidence: 0.98,
    cluster_id: 2,
    coords: { x: -25, y: 8 }
  }
]
