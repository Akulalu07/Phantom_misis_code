import type { Review, ReviewUpdate } from "./types"
import { settings } from "@/shared/config/env"

export const getReviews = async (
  analysisId: number
): Promise<Array<Review>> => {
  const response = await fetch(
    `${settings.backend.api}/analyses/${analysisId}/reviews`
  )

  if (!response.ok) {
    throw new Error("Network response was not ok")
  }

  const json = await response.json()
  return json.data
}

export const getReview = async (id: number): Promise<Review> => {
  const response = await fetch(`${settings.backend.api}/reviews/${id}`)

  if (!response.ok) {
    throw new Error("Network response was not ok")
  }

  return response.json()
}

export const updateReview = async (
  id: number,
  update: ReviewUpdate
): Promise<Review> => {
  const response = await fetch(`${settings.backend.api}/reviews/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(update)
  })

  if (!response.ok) {
    throw new Error("Network response was not ok")
  }

  return response.json()
}

export const deleteReview = async (id: number): Promise<void> => {
  const response = await fetch(`${settings.backend.api}/reviews/${id}`, {
    method: "DELETE"
  })

  if (!response.ok) {
    throw new Error("Network response was not ok")
  }
}
