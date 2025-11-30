import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { getReview, getReviews, updateReview } from "./api"
import { mockReviews } from "./mocks"
import { Sentiment } from "./types"

describe("Reviews API", () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it("getReviews fetches reviews successfully", async () => {
    const mockResponse = { data: mockReviews }

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    } as Response)

    const analysisId = 1
    const result = await getReviews(analysisId)

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/analyses/${analysisId}/reviews`)
    )
    expect(result).toEqual(mockReviews)
  })

  it("getReview fetches a single review successfully", async () => {
    const mockReview = mockReviews[0]

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => mockReview
    } as Response)

    const reviewId = mockReview.id
    const result = await getReview(reviewId)

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/reviews/${reviewId}`)
    )
    expect(result).toEqual(mockReview)
  })

  it("updateReview updates a review successfully", async () => {
    const reviewId = 1
    const updateData = { sentiment: Sentiment.Negative }
    const updatedReview = { ...mockReviews[0], ...updateData }

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => updatedReview
    } as Response)

    const result = await updateReview(reviewId, updateData)

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/reviews/${reviewId}`),
      expect.objectContaining({
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updateData)
      })
    )
    expect(result).toEqual(updatedReview)
  })

  it("throws error when response is not ok", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false
    } as Response)

    await expect(getReviews(1)).rejects.toThrow("Network response was not ok")
  })
})
